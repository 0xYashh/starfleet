'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
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
import { getFreeVehicles, getPaidVehicles, getVehicleById } from '@/lib/data/spaceships';
import { VehiclePreview } from './vehicle-preview';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { UploadButton } from '@/lib/uploadthing';
import Image from 'next/image';
import type { Ship } from '@/lib/types/ship';

// --- Constants ---
const ROLES = ['Founder','Developer','Designer','Artist','Explorer','Creator','Builder'];

// --- Types ---
interface LaunchWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Ship | null;
}

// --- Step 1: Commander Profile ---
const CommanderProfileStep = ({
  commanderName, setCommanderName, selectedRoles, handleRoleChange, otherRole, setOtherRole,
  websiteUrl, setWebsiteUrl, xHandle, setXHandle, instagramHandle, setInstagramHandle, youtubeUrl, setYoutubeUrl
}: {
  commanderName: string; setCommanderName: Dispatch<SetStateAction<string>>;
  selectedRoles: string[]; handleRoleChange: (role: string) => void;
  otherRole: string; setOtherRole: Dispatch<SetStateAction<string>>;
  websiteUrl: string; setWebsiteUrl: Dispatch<SetStateAction<string>>;
  xHandle: string; setXHandle: Dispatch<SetStateAction<string>>;
  instagramHandle: string; setInstagramHandle: Dispatch<SetStateAction<string>>;
  youtubeUrl: string; setYoutubeUrl: Dispatch<SetStateAction<string>>;
}) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold">🧑‍🚀 Commander Profile</h3>
    <p className="text-sm text-white/70">Who’s steering the ship?</p>
    
    <div>
      <label htmlFor="commanderName" className="text-sm font-medium">Commander Name</label>
      <input id="commanderName" type="text" placeholder="Yash Kumar" value={commanderName} onChange={(e) => setCommanderName(e.target.value)} className="w-full mt-1 input-glass" required />
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
        <input type="text" placeholder="X Handle (e.g., yashk)" value={xHandle} onChange={(e) => setXHandle(e.target.value)} className="input-glass" />
        <input type="text" placeholder="Instagram Handle (e.g., yash.k)" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className="input-glass" />
        <input type="url" placeholder="YouTube (optional)" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="input-glass" />
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
      <p className="text-sm text-white/70">{`What's launching into orbit?`}</p>
      
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
            <p className="text-xs text-white/50 mt-1">{`You've reached the 3-tag limit.`}</p>
        )}
      </div>
    </div>
  );
};

// --- Step 3: Visual Deck ---
const VisualDeckStep = ({ setIconFileUrl, setCoverFileUrl }: {
  setIconFileUrl: Dispatch<SetStateAction<string | null>>;
  setCoverFileUrl: Dispatch<SetStateAction<string | null>>;
}) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-black/20 border border-white/20">
        <label className="text-lg font-bold">🚀 Ship Icon</label>
        <p className="text-sm text-white/70 mb-3">A square 1:1 image, max 1MB.</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-md bg-black/20 flex items-center justify-center">
            {iconUploading ? (
              <span className="text-white/40 text-xs animate-pulse">Uploading...</span>
            ) : iconUrl ? (
              <Image src={iconUrl} alt="Icon preview" width={96} height={96} className="rounded-md object-cover" />
            ) : (
              <span className="text-white/40 text-xs">Preview</span>
            )}
          </div>
          <UploadButton
            endpoint="shipIcon"
            onUploadBegin={() => {
              setIconUploading(true);
              setIconError(null);
            }}
            onClientUploadComplete={(res) => {
              setIconUploading(false);
              if (res && res[0]) {
                const url = res[0].url;
                setIconUrl(url);
                setIconFileUrl(url);
              }
            }}
            onUploadError={(error: Error) => {
              setIconUploading(false);
              setIconError(error.message);
            }}
            disabled={iconUploading}
          />
        </div>
        {iconError && <p className="text-red-400 text-xs mt-2">{iconError}</p>}
      </div>

      <div className="p-4 rounded-lg bg-black/20 border border-white/20">
        <label className="text-lg font-bold">🖼️ Cover Image</label>
        <p className="text-sm text-white/70 mb-3">A landscape 16:9 image, max 4MB.</p>
        <div className="flex items-center gap-4">
          <div className="w-48 h-27 rounded-md bg-black/20 flex items-center justify-center">
            {coverUploading ? (
              <span className="text-white/40 text-xs animate-pulse">Uploading...</span>
            ) : coverUrl ? (
              <Image src={coverUrl} alt="Cover preview" width={192} height={108} className="rounded-md object-cover" />
            ) : (
              <span className="text-white/40 text-xs">Preview</span>
            )}
          </div>
          <UploadButton
            endpoint="shipCover"
            onUploadBegin={() => {
              setCoverUploading(true);
              setCoverError(null);
            }}
            onClientUploadComplete={(res) => {
              setCoverUploading(false);
              if (res && res[0]) {
                const url = res[0].url;
                setCoverUrl(url);
                setCoverFileUrl(url);
              }
            }}
            onUploadError={(error: Error) => {
              setCoverUploading(false);
              setCoverError(error.message);
            }}
            disabled={coverUploading}
          />
        </div>
        {coverError && <p className="text-red-400 text-xs mt-2">{coverError}</p>}
      </div>
    </div>
  );
};

// --- Step 4: Choose Vehicle ---
const ChooseVehicleStep = ({ selectedVehicleId, setSelectedVehicleId }: {
  selectedVehicleId: string | null;
  setSelectedVehicleId: Dispatch<SetStateAction<string | null>>;
}) => {
  const freeVehicles = getFreeVehicles();
  const paidVehicles = getPaidVehicles();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">✈️ Free Aircraft</h3>
        <p className="text-sm text-white/70">Launch into the lower orbit atmospheric layer.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {freeVehicles.map(vehicle => (
            <div key={vehicle.id} onClick={() => setSelectedVehicleId(vehicle.id)} className={cn("p-2 rounded-lg border-2 cursor-pointer transition-colors", selectedVehicleId === vehicle.id ? 'border-blue-400 bg-blue-500/20' : 'border-transparent hover:bg-white/10')}>
              <VehiclePreview asset={vehicle} />
              <p className="font-semibold mt-2 text-center">{vehicle.label}</p>
              <p className="text-sm text-center text-green-400">FREE</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold">🚀 Paid Spaceships ($5)</h3>
        <p className="text-sm text-white/70">Soar into the higher orbit space layer.</p>
        <div className="relative group">
          <div className="overflow-hidden" ref={emblaRef}>
             <div className="flex">
              {paidVehicles.map(vehicle => (
                 <div key={vehicle.id} className="flex-shrink-0 flex-grow-0 basis-1/2 md:basis-1/3 p-2">
                  <div onClick={() => setSelectedVehicleId(vehicle.id)} className={cn("p-2 rounded-lg border-2 cursor-pointer transition-colors", selectedVehicleId === vehicle.id ? 'border-blue-400 bg-blue-500/20' : 'border-transparent hover:bg-white/10')}>
                    <VehiclePreview asset={vehicle} />
                    <p className="font-semibold mt-2 text-center">{vehicle.label}</p>
                    <p className="text-sm text-center text-yellow-400">$5</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
           <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-transparent rounded-full text-white/50 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all disabled:opacity-20">
             <ChevronLeft size={24} />
           </button>
           <button onClick={() => emblaApi?.scrollNext()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent rounded-full text-white/50 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all disabled:opacity-20">
             <ChevronRight size={24} />
           </button>
        </div>
      </div>
    </div>
  );
};


export function LaunchWizard({ open, onOpenChange, initialData }: LaunchWizardProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Form State ---
  const [commanderName, setCommanderName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [shipName, setShipName] = useState('');
  const [missionTagline, setMissionTagline] = useState('');
  const [missionBrief, setMissionBrief] = useState('');
  const [status, setStatus] = useState<'Building' | 'Launched'>('Launched');
  const [orbitTags, setOrbitTags] = useState<string[]>([]);
  const [iconFileUrl, setIconFileUrl] = useState<string | null>(null);
  const [coverFileUrl, setCoverFileUrl] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setShipName(initialData.name || '');
      setMissionTagline(initialData.tagline || '');
      setMissionBrief(initialData.description || '');
      setWebsiteUrl(initialData.website_url || '');
      setOrbitTags(initialData.orbit_tags || []);
      setSelectedVehicleId(initialData.spaceship_id || null);
      setIconFileUrl(initialData.icon_url || null);
      setCoverFileUrl(initialData.screenshot_url || null);
    }
  }, [initialData, open]); // Re-run when modal opens with new data

  // --- Handlers ---
  function handleRoleChange(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError("Please select a vehicle before deploying.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const finalRoles = [...selectedRoles];
    if (otherRole) finalRoles.push(otherRole);
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipName,
          spaceshipId: selectedVehicleId,
          websiteUrl,
          tagline: missionTagline,
          description: missionBrief,
          orbitTags,
          iconUrl: iconFileUrl,
          screenshotUrl: coverFileUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      // Success! Close the modal.
      onOpenChange(false);
      // Optionally, you could show a success toast here.
      
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error("Deployment failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function changeStep(newStep: number) {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  }

  const getButtonText = () => {
    if (isLoading) return 'Deploying...';
    if (!selectedVehicleId) {
      return 'Select a Vehicle';
    }
    const vehicle = getVehicleById(selectedVehicleId);
    if (!vehicle) {
        return 'Deploy';
    }
    return vehicle.price === 0 ? 'Deploy for Free' : 'Proceed to Payment'; // Future-proofed
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="backdrop-blur-lg bg-white/10 border-white/20 w-[92vw] sm:w-full sm:max-w-2xl text-white flex flex-col h-[90vh] max-h-[800px]"
        showCloseButton
      >
        <form onSubmit={handleSubmit} style={{ fontFamily: 'var(--font-poppins)' }} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-3xl [font-family:var(--font-barriecito)]">Deploy a new Spaceship</DialogTitle>
            <DialogDescription>
              Step {step} of 4
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-md my-4 text-sm">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="flex-grow overflow-hidden relative py-6">
            <div
              key={step}
              className={cn(
                "absolute inset-0 px-1 animate-in duration-300",
                "pr-4", 
                direction === 1 ? "slide-in-from-right-8" : "slide-in-from-left-8",
                (step === 1 || step === 2 || step === 4) && "overflow-y-auto custom-scrollbar"
              )}
            >
              {step === 1 && <CommanderProfileStep {...{ commanderName, setCommanderName, selectedRoles, handleRoleChange, otherRole, setOtherRole, websiteUrl, setWebsiteUrl, xHandle, setXHandle, instagramHandle, setInstagramHandle, youtubeUrl, setYoutubeUrl }} />}
              {step === 2 && <SpaceshipIdentityStep {...{ shipName, setShipName, missionTagline, setMissionTagline, missionBrief, setMissionBrief, status, setStatus, orbitTags, setOrbitTags }} />}
              {step === 3 && <VisualDeckStep setIconFileUrl={setIconFileUrl} setCoverFileUrl={setCoverFileUrl} />}
              {step === 4 && <ChooseVehicleStep {...{ selectedVehicleId, setSelectedVehicleId }} />}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            {step > 1 && (
              <CartoonButton variant="secondary" size="md" onClick={() => changeStep(step - 1)} type="button" disabled={isLoading}>
                Back
              </CartoonButton>
            )}
            {step < 4 ? (
              <CartoonButton variant="primary" size="md" onClick={() => changeStep(step + 1)} type="button" disabled={isLoading}>
                Next ➔
              </CartoonButton>
            ) : (
              <CartoonButton variant="primary" size="md" type="submit" disabled={!selectedVehicleId || isLoading}>
                {getButtonText()}
              </CartoonButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 