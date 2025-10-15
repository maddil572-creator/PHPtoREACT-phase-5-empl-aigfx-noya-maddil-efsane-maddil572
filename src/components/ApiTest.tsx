/**
 * API Connection Test Component
 * Tests connectivity between React frontend and PHP backend
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api, testConnection, getApiConfig } from '@/utils/apiClient';

interface ApiTestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export function ApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testEndpoints = [
    { name: 'Backend Status', endpoint: '/' },
    { name: 'API Test', endpoint: '/api/test.php' },
    { name: 'Settings API', endpoint: '/api/settings.php' },
    { name: 'Blogs API', endpoint: '/api/blogs.php' },
    { name: 'Portfolio API', endpoint: '/api/portfolio.php' },
    { name: 'Services API', endpoint: '/api/services.php' },
    { name: 'Testimonials API', endpoint: '/api/testimonials.php' },
  ];

  const runTests = async () => {
    setIsLoading(true);
    setOverallStatus('testing');
    const testResults: ApiTestResult[] = [];

    for (const test of testEndpoints) {
      const result: ApiTestResult = {
        endpoint: test.name,
        status: 'pending'
      };

      const startTime = Date.now();
      
      try {
        const response = await api.get(test.endpoint);
        const duration = Date.now() - startTime;
        
        result.status = 'success';
        result.response = response;
        result.duration = duration;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        result.status = 'error';
        result.error = error.message || 'Unknown error';
        result.duration = duration;
      }

      testResults.push(result);
      setResults([...testResults]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const hasErrors = testResults.some(r => r.status === 'error');
    setOverallStatus(hasErrors ? 'error' : 'success');
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Not tested</Badge>;
    }
  };

  const apiConfig = getApiConfig();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Connection Test
          {overallStatus === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
          {overallStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {overallStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Test connectivity between React frontend and PHP backend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* API Configuration */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Configuration</h3>
          <div className="text-sm space-y-1">
            <div><strong>Backend URL:</strong> {apiConfig.baseUrl}</div>
            <div><strong>Environment:</strong> {import.meta.env.VITE_APP_ENV || 'development'}</div>
            <div><strong>Mock Data:</strong> {import.meta.env.VITE_USE_MOCK_DATA || 'false'}</div>
          </div>
        </div>

        {/* Test Button */}
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing API Endpoints...
            </>
          ) : (
            'Run API Tests'
          )}
        </Button>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Test Results</h3>
            
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.endpoint}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {result.duration && (
                    <span className="text-sm text-gray-500">
                      {result.duration}ms
                    </span>
                  )}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Details */}
        {results.some(r => r.status === 'error') && (
          <div className="space-y-2">
            <h3 className="font-medium text-red-600">Error Details</h3>
            {results
              .filter(r => r.status === 'error')
              .map((result, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800">{result.endpoint}</div>
                  <div className="text-sm text-red-600 mt-1">{result.error}</div>
                </div>
              ))}
          </div>
        )}

        {/* Success Summary */}
        {overallStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All tests passed!</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              Your PHP backend is properly connected to the React frontend.
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        {overallStatus === 'error' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium text-yellow-800 mb-2">Troubleshooting Tips</div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure PHP backend server is running on port 8000</li>
              <li>• Check that MySQL database is connected</li>
              <li>• Verify CORS settings in backend/config/config.php</li>
              <li>• Ensure .env file is configured correctly</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}