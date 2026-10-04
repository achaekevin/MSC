import React, { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { ContentWorkflowActions } from '../../components/admin/ContentWorkflowActions';
import { ReviewHistory } from '../../components/admin/ReviewHistory';
import { useContentWorkflow } from '../../hooks/useContentWorkflow';
import { useAuth } from '../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { AlertCircle, Loader2 } from 'lucide-react';

export const ContentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEntityType, setSelectedEntityType] = useState<'Program' | 'NewsArticle'>('Program');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('prog-1');
  const [activeTab, setActiveTab] = useState<'editor' | 'workflow' | 'history'>('workflow');

  const workflow = useContentWorkflow(
    selectedEntityType,
    selectedEntityId,
    user?.permissions || []
  );

  const handleSubmitForReview = async () => {
    try {
      await workflow.submitForReview('Ready for review');
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const handleApprove = async () => {
    try {
      await workflow.approveContent('Looks good!');
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleRequestChanges = async (message: string) => {
    try {
      await workflow.requestChanges(message);
    } catch (err) {
      console.error('Failed to request changes:', err);
    }
  };

  const handlePublish = async () => {
    try {
      await workflow.publishContent('Publishing now');
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Please log in to access content management</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-8">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <h1 className="text-4xl font-extrabold text-charcoal-900 font-display">
            Content Management
          </h1>
          <p className="mt-2 text-lg text-charcoal-700">
            Manage content lifecycle from draft to publication
          </p>
        </Container>
      </section>

      <Container>
        {/* Content Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Entity Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              value={selectedEntityType}
              onChange={(e) => {
                setSelectedEntityType(e.target.value as 'Program' | 'NewsArticle');
                setSelectedEntityId('prog-1');
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="Program">Programs</option>
              <option value="NewsArticle">News Articles</option>
            </select>
          </div>

          {/* Entity ID Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Content
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {selectedEntityType === 'Program' ? (
                <>
                  <option value="prog-1">Case Management Program</option>
                  <option value="prog-2">Psychosocial Support</option>
                  <option value="prog-3">Advocacy & Sensitization</option>
                </>
              ) : (
                <>
                  <option value="news-1">Latest Update 1</option>
                  <option value="news-2">Latest Update 2</option>
                </>
              )}
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <Button
              onClick={workflow.refetch}
              disabled={workflow.isLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {workflow.isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            {workflow.isLoading ? (
              <div className="flex items-center justify-center h-96 text-gray-600">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                Loading content...
              </div>
            ) : (
              <>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="history">Review History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="workflow" className="space-y-6">
                    {workflow.error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">{workflow.error}</p>
                        </div>
                      </div>
                    )}

                    {workflow.status && (
                      <ContentWorkflowActions
                        status={workflow.status}
                        userRole={user?.role}
                        userPermissions={user?.permissions}
                        onSubmitReview={handleSubmitForReview}
                        onApprove={handleApprove}
                        onPublish={handlePublish}
                        onRequestChanges={handleRequestChanges}
                        isLoading={workflow.isSubmitting}
                      />
                    )}

                    {/* Content Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Content Information</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Entity Type</dt>
                          <dd className="font-medium text-gray-900">{selectedEntityType}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Entity ID</dt>
                          <dd className="font-medium text-gray-900">{selectedEntityId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Current Status</dt>
                          <dd className="font-medium">
                            {workflow.status ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                workflow.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                workflow.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                workflow.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {workflow.status === 'IN_REVIEW' ? 'In Review' : workflow.status}
                              </span>
                            ) : 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </TabsContent>

                  <TabsContent value="editor">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <p className="text-gray-600 mb-4">
                        Edit content form would appear here. This demo shows workflow management.
                      </p>
                      <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
                        Editor Panel - Content editing interface
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Review Timeline</h3>
                      <ReviewHistory
                        history={workflow.history}
                        isLoading={workflow.isLoading}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Right Sidebar - Permission Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Permissions</h3>
              <div className="space-y-2 text-sm">
                {user?.permissions && user.permissions.length > 0 ? (
                  <>
                    {user.permissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200"
                      >
                        <span className="text-green-600">✓</span>
                        <span className="text-green-900">{perm}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-600">No permissions assigned</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Workflow Guide</h4>
              <ol className="space-y-2 text-xs text-blue-900">
                <li><strong>1. Draft:</strong> Create and edit content</li>
                <li><strong>2. Submit:</strong> Send for review</li>
                <li><strong>3. Review:</strong> Approver reviews changes</li>
                <li><strong>4. Approved:</strong> Ready to publish</li>
                <li><strong>5. Published:</strong> Live on website</li>
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
