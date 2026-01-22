
import React, { useState, useEffect, useRef } from 'react';
import { SomalipinProfile, SOMALIPIN_CATEGORIES, SUPPORTED_LANGUAGES, Language } from '../types';
import { translateProfile } from '../services/geminiService';

interface ProfileCardProps {
  profile: SomalipinProfile;
  imagePreview: string | null;
  onUpdate: (updatedProfile: SomalipinProfile) => void;
  onImageUpdate: (newImage: string) => void;
  innerRef?: React.RefObject<HTMLDivElement>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, imagePreview, onUpdate, onImageUpdate, innerRef }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Language>('so');
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<SomalipinProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeLang === 'so') {
      setOriginalProfile(profile);
    }
  }, [profile, activeLang]);

  const handleChange = (field: keyof SomalipinProfile, value: any) => {
    onUpdate({ ...profile, [field]: value });
  };

  const handleAchievementChange = (index: number, value: string) => {
    const currentGuulaha = Array.isArray(profile.guulaha) ? [...profile.guulaha] : [];
    currentGuulaha[index] = value;
    handleChange('guulaha', currentGuulaha);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpdate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranslate = async (lang: Language) => {
    if (lang === activeLang) return;
    if (lang === 'so') {
      onUpdate(originalProfile);
      setActiveLang('so');
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateProfile(originalProfile, lang);
      onUpdate(translated);
      setActiveLang(lang);
    } catch (err) {
      console.error('Translation error:', err);
      alert('Waan ka xunnahay, tarjumaadda wey fashilantay.');
    } finally {
      setIsTranslating(false);
    }
  };

  const renderEditButton = (field: string, isText: boolean = false) => {
    const isEditing = editingField === field;
    if (activeLang !== 'so') return null;

    if (isText) {
      return (
        <button
          data-html2canvas-ignore="true"
          onClick={() => setEditingField(isEditing ? null : field)}
          className={`ml-3 px-3 py-1 rounded-md text-xs font-bold transition-all no-print ${
            isEditing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {isEditing ? (
            <><i className="fas fa-save mr-1"></i> Keydi</>
          ) : (
            <><i className="fas fa-edit mr-1"></i> Edit</>
          )}
        </button>
      );
    }
    return (
      <button
        data-html2canvas-ignore="true"
        onClick={() => setEditingField(isEditing ? null : field)}
        className="ml-2 text-blue-400 hover:text-blue-600 transition-colors p-1 no-print"
        title={isEditing ? "Keydi" : "Wax ka bedel"}
      >
        <i className={`fas ${isEditing ? 'fa-check-circle' : 'fa-pen-to-square'} text-sm`}></i>
      </button>
    );
  };

  const achievements = Array.isArray(profile.guulaha) ? profile.guulaha : [];

  return (
    <div ref={innerRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 w-full max-w-2xl mx-auto transform transition-all relative">
      {/* Translation Overlay */}
      {isTranslating && (
        <div data-html2canvas-ignore="true" className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-800 font-bold animate-pulse">Turjumaya...</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-700 to-blue-500 relative">
        <div data-html2canvas-ignore="true" className="absolute top-4 right-4 no-print">
          <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center ${
                  activeLang === lang.code 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-white hover:bg-white/10'
                }`}
                title={lang.name}
              >
                <span className="mr-1">{lang.icon}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Profile Picture Section */}
        <div className="absolute -bottom-12 left-8">
          <div 
            className="group relative w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <i className="fas fa-user text-4xl text-gray-300"></i>
              </div>
            )}
            
            {/* Edit Overlay */}
            <div data-html2canvas-ignore="true" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-print">
              <div className="text-white text-center">
                <i className="fas fa-camera text-xl mb-1"></i>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Badel</p>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>

      <div className="pt-16 pb-8 px-8 bg-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center group">
              {editingField === 'magaca' ? (
                <input
                  type="text"
                  className="text-3xl font-extrabold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full bg-blue-50 px-1"
                  value={profile.magaca || ''}
                  onChange={(e) => handleChange('magaca', e.target.value)}
                  autoFocus
                />
              ) : (
                <h2 className="text-3xl font-extrabold text-gray-900">{profile.magaca || 'Magaca lama helin'}</h2>
              )}
              {renderEditButton('magaca')}
            </div>
            
            <div className="flex items-center mt-2 group bg-blue-50/30 p-1 rounded-lg min-h-[32px]">
              {editingField === 'tagline' ? (
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    className="text-blue-600 font-semibold border-b border-blue-300 focus:outline-none w-full bg-white px-2 py-1 rounded"
                    value={profile.tagline || ''}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-blue-600 font-semibold px-1">{profile.tagline || 'Tagline lama helin'}</p>
              )}
              {renderEditButton('tagline', true)}
            </div>
          </div>

          <div className="flex items-center">
            {editingField === 'category' ? (
              <select
                className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-200 focus:outline-none cursor-pointer"
                value={profile.category}
                onChange={(e) => {
                  handleChange('category', e.target.value);
                  setEditingField(null);
                }}
                autoFocus
              >
                {SOMALIPIN_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-100 uppercase tracking-wide flex items-center">
                {profile.category || 'CATEGORY'}
                {renderEditButton('category')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <i className="fas fa-history mr-2"></i> {activeLang === 'so' ? 'Sooyaal Kooban' : 'Summary'}
              </h3>
              {renderEditButton('sooyaal', true)}
            </div>
            {editingField === 'sooyaal' ? (
              <textarea
                className="w-full text-gray-700 leading-relaxed text-lg bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:outline-none p-3 rounded-xl transition-all"
                rows={4}
                value={profile.sooyaal || ''}
                onChange={(e) => handleChange('sooyaal', e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {profile.sooyaal || 'Sooyaalka qofka laguma guuleysan in la soo saaro.'}
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <i className="fas fa-award mr-2"></i> {activeLang === 'so' ? 'Guulaha & Saameynta' : 'Achievements'}
              </h3>
              {renderEditButton('guulaha')}
            </div>
            <ul className="space-y-2">
              {achievements.length > 0 ? achievements.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3 mt-1">
                    <i className="fas fa-check"></i>
                  </span>
                  {editingField === 'guulaha' ? (
                    <input
                      type="text"
                      className="flex-1 text-gray-700 bg-blue-50 border-b border-blue-200 focus:outline-none px-2 py-1 rounded"
                      value={item}
                      onChange={(e) => handleAchievementChange(idx, e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">{item}</span>
                  )}
                </li>
              )) : (
                <li className="text-gray-400 italic text-sm">Ma jiraan guulo la aqoonsaday.</li>
              )}
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border-l-4 border-blue-500 italic relative group">
            <div className="flex items-center mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{activeLang === 'so' ? 'Xigasho' : 'Quote'}</span>
              {renderEditButton('xigasho')}
            </div>
            {editingField === 'xigasho' ? (
              <textarea
                className="w-full text-gray-600 text-lg leading-relaxed bg-white border border-blue-200 focus:outline-none p-2 rounded-lg"
                rows={2}
                value={profile.xigasho || ''}
                onChange={(e) => handleChange('xigasho', e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-gray-600 text-lg leading-relaxed">
                "{profile.xigasho || 'Guusha waxay ku timaadaa dedaal joogto ah.'}"
              </p>
            )}
          </section>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
            <div className="flex items-center group">
              <i className="fas fa-shield-halved mr-1 text-blue-400"></i>
              {editingField === 'socialProof' ? (
                <input
                  type="text"
                  className="bg-blue-50 border-b border-blue-200 focus:outline-none px-1"
                  value={profile.socialProof || ''}
                  onChange={(e) => handleChange('socialProof', e.target.value)}
                  autoFocus
                />
              ) : (
                <span>{profile.socialProof || 'Source verified by Somalipin AI'}</span>
              )}
              {renderEditButton('socialProof')}
            </div>
            <div className="flex items-center">
              <img src="https://picsum.photos/24/24" className="w-5 h-5 rounded-full mr-2 grayscale" alt="logo" />
              <span>SOMALIPIN AI ENGINE - {activeLang.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
