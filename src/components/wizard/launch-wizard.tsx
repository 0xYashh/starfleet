'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CartoonButton } from '@/components/ui/cartoon-button';
import { cn } from '@/lib/utils';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';

// --- Constants ---
const ROLES = ['Founder','Developer','Designer','Artist','Explorer','Creator','Builder'];

// --- Types ---
interface LaunchWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Step 1: Commander Profile ---
const CommanderProfileStep = ({
  codename, setCodename, displayName, setDisplayName, selectedRoles, handleRoleChange, otherRole, setOtherRole,
  websiteUrl, setWebsiteUrl, xUrl, setXUrl, instagramUrl, setInstagramUrl, youtubeUrl, setYoutubeUrl, discordUrl, setDiscordUrl
}: {
  codename: string; setCodename: Dispatch<SetStateAction<string>>;
  displayName: string; setDisplayName: Dispatch<SetStateAction<string>>;
  selectedRoles: string[]; handleRoleChange: (role: string) => void;
  otherRole: string; setOtherRole: Dispatch<SetStateAction<string>>;
  websiteUrl: string; setWebsiteUrl: Dispatch<SetStateAction<string>>;
  xUrl: string; setXUrl: Dispatch<SetStateAction<string>>;
  instagramUrl: string; setInstagramUrl: Dispatch<SetStateAction<string>>;
  youtubeUrl: string; setYoutubeUrl: Dispatch<SetStateAction<string>>;
  discordUrl: string; setDiscordUrl: Dispatch<SetStateAction<string>>;
}) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold">🧑‍🚀 Commander Profile</h3>
    <p className="text-sm text-white/70">Who’s steering the ship?</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="codename" className="text-sm font-medium">Codename / Handle</label>
        <input id="codename" type="text" placeholder="@yashk, @studio.cool" value={codename} onChange={(e) => setCodename(e.target.value)} className="w-full mt-1 input-glass" required />
      </div>
      <div>
        <label htmlFor="displayName" className="text-sm font-medium">Display Name (optional)</label>
        <input id="displayName" type="text" placeholder="Yash Kumar" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full mt-1 input-glass" />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">Your Role(s)</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
        {ROLES.map(role => (
          <label key={role} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => handleRoleChange(role)} className="checkbox-glass" /> {role}
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={selectedRoles.includes('Other')} onChange={() => handleRoleChange('Other')} className="checkbox-glass" /> Other
        </label>
      </div>
      {selectedRoles.includes('Other') && (
        <input type="text" placeholder="e.g. Space Pirate" value={otherRole} onChange={(e) => setOtherRole(e.target.value)} className="w-full mt-2 input-glass" />
      )}
    </div>
    <div>
      <label className="text-sm font-medium">Mission Control Links</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        <input type="url" placeholder="Website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="input-glass" required/>
        <input type="url" placeholder="X (Twitter)" value={xUrl} onChange={(e) => setXUrl(e.target.value)} className="input-glass" />
        <input type="url" placeholder="Instagram" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="input-glass" />
        <input type="url" placeholder="YouTube" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="input-glass" />
        <input type="url" placeholder="Discord" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} className="input-glass" />
      </div>
    </div>
  </div>
);

// --- Step 2: Spaceship Identity ---
const SpaceshipIdentityStep = ({
  shipName, setShipName, missionTagline, setMissionTagline, missionBrief, setMissionBrief,
  status, setStatus, orbitTags, setOrbitTags
}: {
  shipName: string; setShipName: Dispatch<SetStateAction<string>>;
  missionTagline: string; setMissionTagline: Dispatch<SetStateAction<string>>;
  missionBrief: string; setMissionBrief: Dispatch<SetStateAction<string>>;
  status: 'Building' | 'Launched'; setStatus: Dispatch<SetStateAction<'Building' | 'Launched'>>;
  orbitTags: string[]; setOrbitTags: Dispatch<SetStateAction<string[]>>;
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/#/g, '');
      if (newTag && orbitTags.length < 3 && !orbitTags.includes(newTag)) {
        setOrbitTags([...orbitTags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setOrbitTags(orbitTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">🚀 Spaceship Identity</h3>
      <p className="text-sm text-white/70">What's launching into orbit?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="shipName" className="text-sm font-medium">Ship Name</label>
            <input id="shipName" type="text" placeholder="iReflect" value={shipName} onChange={(e) => setShipName(e.target.value)} className="w-full mt-1 input-glass" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="missionTagline" className="text-sm font-medium">Mission Tagline</label>
            <input id="missionTagline" type="text" placeholder="An AI journaling app for Gen Z to reflect better." value={missionTagline} onChange={(e) => setMissionTagline(e.target.value)} className="w-full mt-1 input-glass" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="missionBrief" className="text-sm font-medium">Mission Brief (100–250 chars)</label>
            <textarea id="missionBrief" rows={3} minLength={100} maxLength={250} placeholder="What’s this thing? Why does it matter?" value={missionBrief} onChange={(e) => setMissionBrief(e.target.value)} className="w-full mt-1 input-glass" required />
          </div>
        </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="status" value="Building" checked={status === 'Building'} onChange={() => setStatus('Building')} className="radio-glass" /> 🛠 Building
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="status" value="Launched" checked={status === 'Launched'} onChange={() => setStatus('Launched')} className="radio-glass" /> ✅ Launched
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="orbitTags" className="text-sm font-medium">Orbit Tags (max  3)</label>
        <div className="flex flex-wrap items-center gap-2 p-2 mt-1 rounded-md bg-black/20 border border-white/20 focus-within:ring-2 focus-within:ring-white/50">
          {orbitTags.map(tag => (
            <div key={tag} className="flex items-center gap-1.5 bg-white/10 text-white px-2 py-1 rounded-md text-sm">
              <span>#{tag}</span>
              <button type="button" onClick={() => removeTag(tag)} className="text-white/70 hover:text-white font-bold text-lg leading-none -translate-y-px">
                &times;
              </button>
            </div>
          ))}
          {orbitTags.length < 3 && (
              <input
                  id="orbitTags"
                  type="text"
                  placeholder="Add tag...like AI, Productivity, SaaS, etc."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="bg-transparent outline-none flex-grow p-1"
              />
          )}
        </div>
        {orbitTags.length >= 3 && (
            <p className="text-xs text-white/50 mt-1">You've reached the 3-tag limit.</p>
        )}
      </div>
    </div>
  );
};

// --- Step 3: Visual Deck ---
const VisualDeckStep = ({
  setIconFile,
  setCoverFile,
}: {
  setIconFile: Dispatch<SetStateAction<File | null>>;
  setCoverFile: Dispatch<SetStateAction<File | null>>;
}) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold">🖼️ Visual Deck</h3>
    <p className="text-sm text-white/70">Make your ship identifiable in the fleet.</p>
    
    <div>
      <label className="text-sm font-medium">App Icon / Emblem</label>
      <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] ?? null)} className="mt-1 file-input-glass" />
    </div>
    <div>
      <label className="text-sm font-medium">Cover Image / Screenshot</label>
      <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="mt-1 file-input-glass" />
    </div>
  </div>
);


export function LaunchWizard({ open, onOpenChange }: LaunchWizardProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // --- Form State ---
  const [codename, setCodename] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [shipName, setShipName] = useState('');
  const [missionTagline, setMissionTagline] = useState('');
  const [missionBrief, setMissionBrief] = useState('');
  const [status, setStatus] = useState<'Building' | 'Launched'>('Launched');
  const [orbitTags, setOrbitTags] = useState<string[]>([]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // --- Handlers ---
  function handleRoleChange(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalRoles = [...selectedRoles];
    if (otherRole) finalRoles.push(otherRole);
    
    console.log({
      codename, displayName, roles: finalRoles, websiteUrl, xUrl, instagramUrl, youtubeUrl, discordUrl,
      shipName, missionTagline, missionBrief, status, orbitTags,
      iconFile, coverFile
    });
    // TODO: Proceed to vehicle selection step
  }

  function changeStep(newStep: number) {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="backdrop-blur-lg bg-white/10 border-white/20 max-w-3xl w-full text-white flex flex-col h-[90vh] max-h-[800px]"
        showCloseButton
      >
        <form onSubmit={handleSubmit} style={{ fontFamily: 'var(--font-poppins)' }} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-3xl [font-family:var(--font-barriecito)]">Deploy a new Spaceship</DialogTitle>
            <DialogDescription>
              Step {step} of 3
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-hidden relative py-6">
            <div
              key={step}
              className={cn(
                "absolute inset-0 px-1 animate-in duration-300",
                "pr-4", 
                direction === 1 ? "slide-in-from-right-8" : "slide-in-from-left-8",
                (step === 1 || step === 2) && "overflow-y-auto custom-scrollbar"
              )}
            >
              {step === 1 && <CommanderProfileStep {...{ codename, setCodename, displayName, setDisplayName, selectedRoles, handleRoleChange, otherRole, setOtherRole, websiteUrl, setWebsiteUrl, xUrl, setXUrl, instagramUrl, setInstagramUrl, youtubeUrl, setYoutubeUrl, discordUrl, setDiscordUrl }} />}
              {step === 2 && <SpaceshipIdentityStep {...{ shipName, setShipName, missionTagline, setMissionTagline, missionBrief, setMissionBrief, status, setStatus, orbitTags, setOrbitTags }} />}
              {step === 3 && <VisualDeckStep {...{ setIconFile, setCoverFile }} />}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            {step > 1 && (
              <CartoonButton variant="secondary" size="md" onClick={() => changeStep(step - 1)} type="button">
                Back
              </CartoonButton>
            )}
            {step < 3 ? (
              <CartoonButton variant="primary" size="md" onClick={() => changeStep(step + 1)} type="button">
                Next ➔
              </CartoonButton>
            ) : (
              <CartoonButton variant="primary" size="md" type="submit">
                Choose Spaceship ➔
              </CartoonButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 