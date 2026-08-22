import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import type { Trip } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AIPromptGeneratorProps {
  trip: Trip;
}

export const AIPromptGenerator: React.FC<AIPromptGeneratorProps> = ({ trip }) => {
  const [preferences, setPreferences] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate a slight delay for UX
    setTimeout(() => {
      // Build the context string
      const stopsContext = trip.stops?.map(stop => {
        const activities = stop.activities?.map(a => `- ${a.activity.name} (${a.activity.duration} hrs)`).join('\n') || '- No specific activities planned yet.';
        return `Destination: ${stop.city?.name}\nDates: ${new Date(stop.startDate).toDateString()} to ${new Date(stop.endDate).toDateString()}\nPlanned Activities:\n${activities}`;
      }).join('\n\n') || 'No destinations added yet.';

      const prompt = `You are an expert travel agent AI. Please generate a detailed, day-by-day itinerary for the following trip.

Trip Name: ${trip.name}
Trip Dates: ${new Date(trip.startDate).toDateString()} to ${new Date(trip.endDate).toDateString()}
Overall Description: ${trip.description || 'Not provided'}

User Preferences:
"${preferences || 'Create a balanced itinerary with a mix of sightseeing, food, and relaxation.'}"

Current Itinerary Draft (incorporate these fixed plans into your day-by-day schedule):
${stopsContext}

Please provide a highly detailed schedule for each day, including estimated travel times between locations, recommended restaurants for breakfast/lunch/dinner, and practical tips for each specific city. Format the response clearly in Markdown.`;

      setGeneratedPrompt(prompt);
      setIsCopied(false);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-background to-primary/5 border-primary/20 shadow-sm mb-8">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-textPrimary">AI Itinerary Generator</h2>
        </div>
        <p className="text-textSecondary mb-6 text-sm max-w-3xl">
          Use AI to fill in the gaps! Write your travel preferences below, and we'll merge them with your current destinations and activities to create a master prompt. You can send this prompt to an LLM to generate your complete daily schedule.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textPrimary">
              Your Travel Preferences
            </label>
            <textarea
              className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-base placeholder:text-textSecondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors min-h-[100px] resize-y"
              placeholder="e.g. I want a relaxed trip, focusing on cheap street food, hidden gems, and avoiding heavy crowds. I wake up late around 10 AM."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? 'Compiling Context...' : 'Generate Master Prompt'}
          </Button>

          {generatedPrompt && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-textPrimary">
                  Generated Prompt
                </label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className={`h-8 px-3 text-xs ${isCopied ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-textSecondary hover:text-primary'}`}
                >
                  {isCopied ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Prompt</>
                  )}
                </Button>
              </div>
              <div className="relative">
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                  {generatedPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
