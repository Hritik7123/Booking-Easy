"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Rule {
  id: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  timezone: string;
}

interface DashboardFormProps {
  rules: Rule[];
  providerId?: string;
  addRuleAction: (formData: FormData) => Promise<void>;
  removeRuleAction: (formData: FormData) => Promise<void>;
  generateSlotsAction: () => Promise<void>;
}

export default function DashboardForm({
  rules,
  providerId,
  addRuleAction,
  removeRuleAction,
  generateSlotsAction,
}: DashboardFormProps) {
  const [weekday, setWeekday] = useState(0);
  const [startMinutes, setStartMinutes] = useState("");
  const [endMinutes, setEndMinutes] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localRules, setLocalRules] = useState(rules);
  const [generatedSlots, setGeneratedSlots] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    
    // Load from localStorage after component mounts
    const savedRules = localStorage.getItem('provider-rules');
    if (savedRules) {
      setLocalRules(JSON.parse(savedRules));
    }
    
    const savedSlots = localStorage.getItem('generated-slots');
    if (savedSlots) {
      setGeneratedSlots(JSON.parse(savedSlots));
    }
  }, []);

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add rule to local state immediately for demo purposes
    const newRule = {
      id: `rule-${Date.now()}`,
      weekday,
      startMinutes: Number(startMinutes),
      endMinutes: Number(endMinutes),
      timezone,
    };
    
    const updatedRules = [...localRules, newRule];
    setLocalRules(updatedRules);
    
    // Save to localStorage for persistence
    if (isClient) {
      localStorage.setItem('provider-rules', JSON.stringify(updatedRules));
    }
    
    // Call the server action
    const formData = new FormData();
    formData.append("weekday", weekday.toString());
    formData.append("start", startMinutes);
    formData.append("end", endMinutes);
    formData.append("tz", timezone);
    
    await addRuleAction(formData);
    
    // Reset form
    setStartMinutes("");
    setEndMinutes("");
  };

  const handleRemoveRule = async (ruleId: string) => {
    // Remove from local state immediately
    const updatedRules = localRules.filter(rule => rule.id !== ruleId);
    setLocalRules(updatedRules);
    
    // Save to localStorage for persistence
    if (isClient) {
      localStorage.setItem('provider-rules', JSON.stringify(updatedRules));
    }
    
    // Call the server action
    const formData = new FormData();
    formData.append("id", ruleId);
    await removeRuleAction(formData);
  };

  const handleGenerateSlots = async () => {
    if (!providerId) return;
    setIsGenerating(true);
    try {
      await generateSlotsAction();
      
      // Save generated slots info to localStorage
      if (isClient) {
        const slotsInfo = {
          generatedAt: new Date().toISOString(),
          rulesCount: localRules.length,
          providerId: providerId
        };
        localStorage.setItem('generated-slots', JSON.stringify(slotsInfo));
        setGeneratedSlots(slotsInfo);
      }
      
      alert("Slots generated successfully!");
    } catch (error) {
      alert("Error generating slots. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h2 className="mt-6 font-semibold">Availability</h2>
      
      {/* Add Rule Form */}
      <form onSubmit={handleAddRule} className="mt-2 flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Day</label>
          <select 
            value={weekday} 
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {weekdayNames.map((n, i) => (
              <option key={i} value={i}>{n}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Start (minutes)</label>
          <input 
            value={startMinutes}
            onChange={(e) => setStartMinutes(e.target.value)}
            type="number" 
            min="0" 
            max="1439" 
            placeholder="540 (9am)" 
            className="border rounded px-2 py-1 w-28"
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">End (minutes)</label>
          <input 
            value={endMinutes}
            onChange={(e) => setEndMinutes(e.target.value)}
            type="number" 
            min="1" 
            max="1440" 
            placeholder="1020 (5pm)" 
            className="border rounded px-2 py-1 w-28"
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Timezone</label>
          <input 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="border rounded px-2 py-1 w-28"
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </form>

      {/* Time Helper */}
      <div className="mt-2 text-sm text-gray-600">
        <p>💡 Time helper: 9:00 AM = 540, 5:00 PM = 1020, 6:00 PM = 1080</p>
      </div>

      {/* Current Rules */}
      <ul className="mt-4 space-y-2">
        {localRules.map((r) => (
          <li key={r.id} className="flex items-center justify-between border rounded p-3 bg-gray-50">
            <div>
              <span className="font-medium">{weekdayNames[r.weekday]}</span>
              <span className="ml-2 text-gray-600">
                {minutesToTime(r.startMinutes)} - {minutesToTime(r.endMinutes)}
              </span>
              <span className="ml-2 text-sm text-gray-500">({r.timezone})</span>
            </div>
            <button 
              onClick={() => handleRemoveRule(r.id)}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {localRules.length === 0 && (
        <p className="mt-4 text-gray-500 text-sm">No availability rules set. Add some above to get started!</p>
      )}

      {/* Generated Slots Info */}
      {generatedSlots && isClient && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h3 className="font-medium text-green-800">Generated Slots</h3>
          <p className="text-sm text-green-700">
            Slots generated on {new Date(generatedSlots.generatedAt).toLocaleString()} 
            based on {generatedSlots.rulesCount} availability rules.
          </p>
        </div>
      )}

      {/* Generate Slots */}
      <div className="mt-6">
        <button 
          onClick={handleGenerateSlots}
          disabled={isGenerating || !providerId || localRules.length === 0}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Slots (21 days, 60min slots)"}
        </button>
        {!providerId && (
          <p className="mt-2 text-sm text-red-600">No provider ID found. Please ensure you're logged in as a provider.</p>
        )}
        {localRules.length === 0 && (
          <p className="mt-2 text-sm text-yellow-600">Add availability rules first before generating slots.</p>
        )}
      </div>
    </div>
  );
}