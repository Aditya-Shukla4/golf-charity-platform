"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Plus, Trash2, Star, Loader2, ExternalLink } from "lucide-react";
import type { Charity } from "@/types";
import toast from "react-hot-toast";

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  async function fetchCharities() {
    const supabase = createClient();
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("is_featured", { ascending: false });
    setCharities(data ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchCharities();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("charities").insert({
      name,
      description,
      image_url: imageUrl || null,
      website_url: websiteUrl || null,
      is_featured: isFeatured,
      is_active: true,
    });
    if (error) {
      toast.error("Failed to add charity");
    } else {
      toast.success("Charity added!");
      setName("");
      setDescription("");
      setImageUrl("");
      setWebsiteUrl("");
      setIsFeatured(false);
      setShowForm(false);
      fetchCharities();
    }
    setLoading(false);
  }

  async function handleToggleFeatured(id: string, current: boolean) {
    const supabase = createClient();
    await supabase
      .from("charities")
      .update({ is_featured: !current })
      .eq("id", id);
    fetchCharities();
  }

  async function handleToggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase
      .from("charities")
      .update({ is_active: !current })
      .eq("id", id);
    toast.success(current ? "Charity deactivated" : "Charity activated");
    fetchCharities();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this charity?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      fetchCharities();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Charities</h1>
          <p className="text-gray-400 text-sm mt-1">
            {charities.length} charities listed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add charity
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Add new charity</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Charity name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">
                  Website URL
                </label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this charity do?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">
                Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-green-500"
              />
              <label htmlFor="featured" className="text-sm text-gray-400">
                Feature this charity on homepage
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add charity
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-white/5">
          <Heart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No charities yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charities.map((charity) => (
            <div
              key={charity.id}
              className="glass rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{charity.name}</h3>
                    {charity.is_featured && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                        Featured
                      </span>
                    )}
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        charity.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {charity.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {charity.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {charity.description}
                    </p>
                  )}
                  {charity.website_url && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-green-400 mt-1 cursor-pointer"
                      onClick={() =>
                        window.open(charity.website_url!, "_blank")
                      }
                    >
                      {charity.website_url} <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleToggleFeatured(charity.id, charity.is_featured)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      charity.is_featured
                        ? "text-yellow-400 bg-yellow-500/20"
                        : "text-gray-600 hover:text-yellow-400 bg-white/5"
                    }`}
                    title="Toggle featured"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleToggleActive(charity.id, charity.is_active)
                    }
                    className="text-xs border border-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {charity.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(charity.id)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
