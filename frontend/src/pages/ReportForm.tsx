import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../api/reports";
import { GlassCard } from "../components/GlassCard";
import { LocationPicker } from "../components/LocationPicker";
import type { DuplicateInfo, ReportCategory } from "../types";

const CATEGORIES: { value: ReportCategory | ""; label: string }[] = [
  { value: "", label: "Let AI decide" },
  { value: "pothole", label: "Pothole" },
  { value: "lighting", label: "Broken lighting" },
  { value: "waste", label: "Illegal waste dumping" },
  { value: "flooding", label: "Flooding" },
  { value: "other", label: "Other" },
];

export function ReportForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[] | null>(null);

  const handlePhotoChange = (file: File | null) => {
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError("Please select a location on the map.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // Photo storage/upload is not part of this scaffold; image_urls is left
      // empty until an upload endpoint/object-storage integration is added.
      const { possible_duplicates } = await createReport({
        title,
        description,
        category: category || undefined,
        latitude: location.lat,
        longitude: location.lng,
        image_urls: [],
      });

      if (possible_duplicates.length > 0) {
        setDuplicates(possible_duplicates);
      } else {
        navigate("/map");
      }
    } catch {
      setError("Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="mb-6 text-2xl font-semibold">Report an issue</h1>

        {duplicates ? (
          <GlassCard>
            <h2 className="mb-2 text-lg font-medium">Possible duplicate reports nearby</h2>
            <p className="mb-4 text-sm text-charcoal-900/60 dark:text-sage-50/60">
              We found similar open reports close to this location. Your report has been submitted and linked, but
              you may want to review these first.
            </p>
            <ul className="mb-4 flex flex-col gap-2">
              {duplicates.map((dup) => (
                <li key={dup.report_id} className="glass-input flex items-center justify-between text-sm">
                  <span>{dup.title}</span>
                  <span className="text-charcoal-900/50 dark:text-sage-50/50">
                    {Math.round(dup.distance_meters)}m · {Math.round(dup.similarity * 100)}% match
                  </span>
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full" onClick={() => navigate("/map")}>
              Go to map
            </button>
          </GlassCard>
        ) : (
          <GlassCard>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="Large pothole on Elm Street"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  minLength={10}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input resize-none"
                  placeholder="Describe what you saw, when, and how severe it is..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory | "")}
                  className="glass-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="photo" className="text-sm font-medium">
                  Photo
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                  className="glass-input file:mr-3 file:rounded-lg file:border-0 file:bg-sage-500/80 file:px-3 file:py-1.5 file:text-white"
                />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="mt-2 h-40 w-full rounded-xl object-cover" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Location</span>
                <LocationPicker value={location} onChange={setLocation} />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </form>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
