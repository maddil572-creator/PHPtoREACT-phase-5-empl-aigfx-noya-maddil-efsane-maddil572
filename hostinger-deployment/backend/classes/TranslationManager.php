<?php
/**
 * Translation Manager
 * Handles multilingual translations with auto-translation and manual overrides
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class TranslationManager {
    private $db;
    private $cache;
    private $cacheEnabled;
    private $googleApiKey;

    private const CACHE_TTL = 86400;
    private const CACHE_PREFIX = 'translation_';

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->cache = new Cache();
        $this->cacheEnabled = $_ENV['CACHE_ENABLED'] ?? true;
        $this->googleApiKey = $_ENV['GOOGLE_TRANSLATE_API_KEY'] ?? null;
    }

    public function getTranslation($contentType, $contentId, $fieldName, $langCode, $fallbackText = null) {
        $cacheKey = self::CACHE_PREFIX . md5("{$contentType}_{$contentId}_{$fieldName}_{$langCode}");

        if ($this->cacheEnabled) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== null) {
                return $cached;
            }
        }

        $query = "SELECT translated_text, manual_override, translation_method, quality_score
                  FROM translations
                  WHERE content_type = :content_type
                    AND (content_id = :content_id OR (content_id IS NULL AND :content_id IS NULL))
                    AND field_name = :field_name
                    AND lang_code = :lang_code
                  LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':content_type' => $contentType,
            ':content_id' => $contentId,
            ':field_name' => $fieldName,
            ':lang_code' => $langCode
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && !empty($result['translated_text'])) {
            $translation = $result['translated_text'];
        } else {
            $translation = $fallbackText;
        }

        if ($this->cacheEnabled && $translation) {
            $this->cache->set($cacheKey, $translation, self::CACHE_TTL);
        }

        return $translation;
    }

    public function getTranslations($contentType, $contentId, $langCode) {
        $cacheKey = self::CACHE_PREFIX . "batch_{$contentType}_{$contentId}_{$langCode}";

        if ($this->cacheEnabled) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== null) {
                return $cached;
            }
        }

        $query = "SELECT field_name, translated_text, manual_override
                  FROM translations
                  WHERE content_type = :content_type
                    AND content_id = :content_id
                    AND lang_code = :lang_code";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':content_type' => $contentType,
            ':content_id' => $contentId,
            ':lang_code' => $langCode
        ]);

        $translations = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $translations[$row['field_name']] = [
                'text' => $row['translated_text'],
                'manual' => (bool)$row['manual_override']
            ];
        }

        if ($this->cacheEnabled && !empty($translations)) {
            $this->cache->set($cacheKey, $translations, self::CACHE_TTL);
        }

        return $translations;
    }

    public function autoTranslate($text, $sourceLang, $targetLang) {
        if (empty($text) || $sourceLang === $targetLang) {
            return $text;
        }

        $textHash = md5($text);
        $cached = $this->getFromCache($textHash, $sourceLang, $targetLang);

        if ($cached !== null) {
            return $cached;
        }

        if (empty($this->googleApiKey)) {
            error_log("Google Translate API key not configured");
            return $text;
        }

        try {
            $translatedText = $this->callGoogleTranslateAPI($text, $sourceLang, $targetLang);

            if ($translatedText) {
                $this->saveToCache($textHash, $sourceLang, $targetLang, $text, $translatedText);
                return $translatedText;
            }
        } catch (Exception $e) {
            error_log("Translation API error: " . $e->getMessage());
        }

        return $text;
    }

    private function callGoogleTranslateAPI($text, $sourceLang, $targetLang) {
        $url = 'https://translation.googleapis.com/language/translate/v2';

        $data = [
            'q' => $text,
            'source' => $sourceLang,
            'target' => $targetLang,
            'format' => 'text',
            'key' => $this->googleApiKey
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $result = json_decode($response, true);

            if (isset($result['data']['translations'][0]['translatedText'])) {
                return $result['data']['translations'][0]['translatedText'];
            }
        }

        return null;
    }

    private function getFromCache($textHash, $sourceLang, $targetLang) {
        $query = "SELECT translated_text, cache_hits
                  FROM translation_cache
                  WHERE source_text_hash = :hash
                    AND source_lang = :source
                    AND target_lang = :target
                    AND (expires_at IS NULL OR expires_at > NOW())
                  LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':hash' => $textHash,
            ':source' => $sourceLang,
            ':target' => $targetLang
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $updateQuery = "UPDATE translation_cache
                           SET cache_hits = cache_hits + 1
                           WHERE source_text_hash = :hash
                             AND source_lang = :source
                             AND target_lang = :target";

            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([
                ':hash' => $textHash,
                ':source' => $sourceLang,
                ':target' => $targetLang
            ]);

            return $result['translated_text'];
        }

        return null;
    }

    private function saveToCache($textHash, $sourceLang, $targetLang, $sourceText, $translatedText) {
        $query = "INSERT INTO translation_cache
                  (source_text_hash, source_lang, target_lang, source_text, translated_text, expires_at)
                  VALUES (:hash, :source, :target, :source_text, :translated, DATE_ADD(NOW(), INTERVAL 30 DAY))
                  ON DUPLICATE KEY UPDATE
                    translated_text = VALUES(translated_text),
                    expires_at = VALUES(expires_at)";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':hash' => $textHash,
            ':source' => $sourceLang,
            ':target' => $targetLang,
            ':source_text' => substr($sourceText, 0, 1000),
            ':translated' => $translatedText
        ]);
    }

    public function saveTranslation($contentType, $contentId, $fieldName, $langCode, $originalText, $translatedText, $manualOverride = false) {
        $this->clearTranslationCache($contentType, $contentId, $fieldName, $langCode);

        $method = $manualOverride ? 'manual' : 'auto';

        $query = "INSERT INTO translations
                  (content_type, content_id, field_name, lang_code, original_text, translated_text, manual_override, translation_method)
                  VALUES (:type, :id, :field, :lang, :original, :translated, :manual, :method)
                  ON DUPLICATE KEY UPDATE
                    translated_text = VALUES(translated_text),
                    manual_override = VALUES(manual_override),
                    translation_method = VALUES(translation_method),
                    last_updated = CURRENT_TIMESTAMP";

        $stmt = $this->db->prepare($query);
        $result = $stmt->execute([
            ':type' => $contentType,
            ':id' => $contentId,
            ':field' => $fieldName,
            ':lang' => $langCode,
            ':original' => $originalText,
            ':translated' => $translatedText,
            ':manual' => $manualOverride ? 1 : 0,
            ':method' => $method
        ]);

        return $result;
    }

    public function bulkAutoTranslate($contentType, $targetLang, $limit = 50) {
        $query = "SELECT DISTINCT
                    t1.content_id,
                    t1.field_name,
                    t1.original_text
                  FROM translations t1
                  WHERE t1.content_type = :content_type
                    AND t1.lang_code = 'en'
                    AND NOT EXISTS (
                        SELECT 1 FROM translations t2
                        WHERE t2.content_type = t1.content_type
                          AND t2.content_id = t1.content_id
                          AND t2.field_name = t1.field_name
                          AND t2.lang_code = :target_lang
                    )
                  LIMIT :limit";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':content_type', $contentType, PDO::PARAM_STR);
        $stmt->bindValue(':target_lang', $targetLang, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $translated = 0;

        foreach ($results as $row) {
            $translatedText = $this->autoTranslate($row['original_text'], 'en', $targetLang);

            if ($translatedText && $translatedText !== $row['original_text']) {
                $this->saveTranslation(
                    $contentType,
                    $row['content_id'],
                    $row['field_name'],
                    $targetLang,
                    $row['original_text'],
                    $translatedText,
                    false
                );
                $translated++;
            }
        }

        return [
            'processed' => count($results),
            'translated' => $translated,
            'target_lang' => $targetLang
        ];
    }

    public function getSupportedLanguages($activeOnly = true) {
        $cacheKey = self::CACHE_PREFIX . 'languages_' . ($activeOnly ? 'active' : 'all');

        if ($this->cacheEnabled) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== null) {
                return $cached;
            }
        }

        $query = "SELECT * FROM supported_languages";
        if ($activeOnly) {
            $query .= " WHERE active = 1";
        }
        $query .= " ORDER BY sort_order ASC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();

        $languages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($this->cacheEnabled) {
            $this->cache->set($cacheKey, $languages, self::CACHE_TTL);
        }

        return $languages;
    }

    public function getTranslationStats($langCode = null) {
        $query = "SELECT * FROM translation_completion_overview";
        if ($langCode) {
            $query .= " WHERE lang_code = :lang_code";
        }
        $query .= " ORDER BY lang_code";

        $stmt = $this->db->prepare($query);
        if ($langCode) {
            $stmt->bindValue(':lang_code', $langCode);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAdminTranslations($langCode, $contentType = null, $manualOnly = false, $page = 1, $limit = 50) {
        $offset = ($page - 1) * $limit;

        $query = "SELECT
                    id,
                    content_type,
                    content_id,
                    field_name,
                    lang_code,
                    original_text,
                    translated_text,
                    manual_override,
                    translation_method,
                    last_updated
                  FROM translations
                  WHERE lang_code = :lang_code";

        if ($contentType) {
            $query .= " AND content_type = :content_type";
        }

        if ($manualOnly) {
            $query .= " AND manual_override = 1";
        }

        $query .= " ORDER BY last_updated DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':lang_code', $langCode, PDO::PARAM_STR);
        if ($contentType) {
            $stmt->bindValue(':content_type', $contentType, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $countQuery = "SELECT COUNT(*) as total FROM translations WHERE lang_code = :lang_code";
        if ($contentType) {
            $countQuery .= " AND content_type = :content_type";
        }
        if ($manualOnly) {
            $countQuery .= " AND manual_override = 1";
        }

        $countStmt = $this->db->prepare($countQuery);
        $countStmt->bindValue(':lang_code', $langCode, PDO::PARAM_STR);
        if ($contentType) {
            $countStmt->bindValue(':content_type', $contentType, PDO::PARAM_STR);
        }
        $countStmt->execute();

        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ];
    }

    private function clearTranslationCache($contentType, $contentId, $fieldName, $langCode) {
        $cacheKeys = [
            self::CACHE_PREFIX . md5("{$contentType}_{$contentId}_{$fieldName}_{$langCode}"),
            self::CACHE_PREFIX . "batch_{$contentType}_{$contentId}_{$langCode}"
        ];

        foreach ($cacheKeys as $key) {
            $this->cache->delete($key);
        }
    }

    public function updateLanguageStatus($langCode, $active) {
        $query = "UPDATE supported_languages SET active = :active WHERE lang_code = :lang_code";
        $stmt = $this->db->prepare($query);
        $result = $stmt->execute([
            ':active' => $active ? 1 : 0,
            ':lang_code' => $langCode
        ]);

        $this->cache->delete(self::CACHE_PREFIX . 'languages_active');
        $this->cache->delete(self::CACHE_PREFIX . 'languages_all');

        return $result;
    }
}
