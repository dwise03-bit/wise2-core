'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ImageReference {
  id: string;
  url: string;
  role: 'LOCKED' | 'EDITABLE' | 'NEW';
  kind: string;
}

interface HermesResult {
  imageUrl?: string;
  provider?: string;
  preservedReferenceIds?: string[];
  preservationGuaranteed?: boolean;
  status?: string;
  jobId?: string;
  error?: string;
}

export default function HermesPage() {
  const [instruction, setInstruction] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [references, setReferences] = useState<ImageReference[]>([]);
  const [refId, setRefId] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [refRole, setRefRole] = useState<'LOCKED' | 'EDITABLE' | 'NEW'>('LOCKED');
  const [refKind, setRefKind] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HermesResult | null>(null);
  const [error, setError] = useState('');

  const handleAddReference = () => {
    if (refId && refUrl && refKind) {
      setReferences([
        ...references,
        {
          id: refId,
          url: refUrl,
          role: refRole,
          kind: refKind,
        },
      ]);
      setRefId('');
      setRefUrl('');
      setRefRole('LOCKED');
      setRefKind('');
    }
  };

  const handleRemoveReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/hermes/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction,
          references,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setInstruction('');
      setReferences([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎨 Hermes Image Orchestrator</h1>
          <p className="text-gray-400">
            Generate images with locked asset preservation and provider-neutral generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1a1a2e] border border-[#2cd588]/30">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Instruction */}
                <div className="space-y-2">
                  <Label className="text-[#2cd588]">Generation Instruction *</Label>
                  <Textarea
                    placeholder="Describe what you want to generate. Include details about locked elements to preserve and editable elements to enhance..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="min-h-32 bg-[#0f0f1e] border-[#2cd588]/30 text-white placeholder-gray-600"
                    required
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label className="text-[#2cd588]">Aspect Ratio</Label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-[#0f0f1e] border border-[#2cd588]/30 rounded px-3 py-2 text-white"
                  >
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Widescreen (16:9)</option>
                    <option value="9:16">Vertical (9:16)</option>
                    <option value="4:3">Standard (4:3)</option>
                    <option value="3:2">Classic (3:2)</option>
                  </select>
                </div>

                {/* References */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#2cd588]">Asset References</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Define images to include in generation
                    </p>
                  </div>

                  {/* Add Reference */}
                  <div className="bg-[#0f0f1e] rounded-lg p-4 space-y-3 border border-[#2cd588]/20">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Reference ID"
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                        className="bg-[#1a1a2e] border-[#2cd588]/30 text-white"
                      />
                      <select
                        value={refRole}
                        onChange={(e) => setRefRole(e.target.value as any)}
                        className="bg-[#1a1a2e] border border-[#2cd588]/30 rounded px-2 py-2 text-white"
                      >
                        <option value="LOCKED">🔒 Locked</option>
                        <option value="EDITABLE">✏️ Editable</option>
                        <option value="NEW">✨ New</option>
                      </select>
                    </div>

                    <Input
                      placeholder="Image URL"
                      value={refUrl}
                      onChange={(e) => setRefUrl(e.target.value)}
                      className="bg-[#1a1a2e] border-[#2cd588]/30 text-white"
                    />

                    <Input
                      placeholder="Asset Kind (e.g., 'hardware', 'photo', 'artwork')"
                      value={refKind}
                      onChange={(e) => setRefKind(e.target.value)}
                      className="bg-[#1a1a2e] border-[#2cd588]/30 text-white"
                    />

                    <Button
                      type="button"
                      onClick={handleAddReference}
                      className="w-full bg-[#2cd588] text-black hover:bg-[#2cd588]/90"
                      disabled={!refId || !refUrl || !refKind}
                    >
                      + Add Reference
                    </Button>
                  </div>

                  {/* References List */}
                  {references.length > 0 && (
                    <div className="space-y-2">
                      {references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#0f0f1e] p-3 rounded border border-[#2cd588]/20"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{ref.id}</div>
                            <div className="text-xs text-gray-500 truncate">{ref.url}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{ref.role}</Badge>
                              <Badge variant="secondary">{ref.kind}</Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReference(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-950/20 border border-red-500/30 rounded p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#2cd588] text-black hover:bg-[#2cd588]/90 font-semibold py-2 text-base"
                  disabled={!instruction || loading}
                >
                  {loading ? '🔄 Generating...' : '✨ Generate Image'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card className="bg-[#1a1a2e] border border-[#2cd588]/30 sticky top-8">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#2cd588] mb-4">Result</h3>

                  {!result ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-sm">
                        Submit a generation request to see results
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Status */}
                      {result.status && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <Badge
                            className={
                              result.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : result.status === 'failed'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                      )}

                      {/* Job ID */}
                      {result.jobId && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Job ID</p>
                          <p className="text-sm font-mono text-gray-300 break-all">{result.jobId}</p>
                        </div>
                      )}

                      {/* Provider */}
                      {result.provider && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Provider</p>
                          <p className="text-sm text-gray-300">{result.provider}</p>
                        </div>
                      )}

                      {/* Generated Image */}
                      {result.imageUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Generated Image</p>
                          <img
                            src={result.imageUrl}
                            alt="Generated"
                            className="w-full rounded border border-[#2cd588]/30"
                          />
                        </div>
                      )}

                      {/* Preserved References */}
                      {result.preservedReferenceIds && result.preservedReferenceIds.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">🔒 Preserved Assets</p>
                          <div className="space-y-1">
                            {result.preservedReferenceIds.map((id) => (
                              <p key={id} className="text-sm text-gray-400">
                                ✓ {id}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preservation Guaranteed */}
                      {result.preservationGuaranteed !== undefined && (
                        <div className="pt-4 border-t border-[#2cd588]/20">
                          <p className="text-xs">
                            <span className="text-gray-500">Asset Preservation: </span>
                            <span
                              className={
                                result.preservationGuaranteed
                                  ? 'text-green-400 font-semibold'
                                  : 'text-yellow-400'
                              }
                            >
                              {result.preservationGuaranteed ? '✓ Guaranteed' : '⚠️ Not Guaranteed'}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Error */}
                      {result.error && (
                        <div className="bg-red-950/20 border border-red-500/30 rounded p-2">
                          <p className="text-red-400 text-xs">{result.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-[#1a1a2e] border border-[#2cd588]/30 p-6">
            <div className="flex gap-3">
              <span className="text-3xl">🔒</span>
              <div>
                <h4 className="font-semibold text-[#2cd588]">Locked Assets</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Elements marked as LOCKED will be preserved exactly in the generated image
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border border-[#2cd588]/30 p-6">
            <div className="flex gap-3">
              <span className="text-3xl">✏️</span>
              <div>
                <h4 className="font-semibold text-[#2cd588]">Editable Assets</h4>
                <p className="text-sm text-gray-500 mt-1">
                  EDITABLE elements can be modified, enhanced, or improved by the provider
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border border-[#2cd588]/30 p-6">
            <div className="flex gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <h4 className="font-semibold text-[#2cd588]">New Assets</h4>
                <p className="text-sm text-gray-500 mt-1">
                  NEW elements should be generated fresh by the provider to match the instruction
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
