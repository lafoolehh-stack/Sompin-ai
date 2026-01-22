
import React, { useState, useRef } from 'react';
import { AppStatus, SomalipinProfile } from './types';
import { generateProfileFromImage } from './services/geminiService';
import ProfileCard from './components/ProfileCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [profile, setProfile] = useState<SomalipinProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStatus(AppStatus.IDLE);
        setProfile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!imagePreview) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const result = await generateProfileFromImage(imagePreview);
      setProfile(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError('Cillad ayaa dhacday intii la farsameynayay sawirka. Fadlan isku day markale.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleProfileUpdate = (updatedProfile: SomalipinProfile) => {
    setProfile(updatedProfile);
  };

  const reset = () => {
    setImagePreview(null);
    setProfile(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadPDF = async () => {
    if (!cardRef.current || !profile) return;
    
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Nidaamka PDF lama helin. Fadlan bogga dib u cusboonaysii.");
      return;
    }

    setIsExporting(true);
    const element = cardRef.current;
    
    // Professional grade PDF configuration
    const opt = {
      margin: [15, 15, 15, 15], // Standard margins for professional print
      filename: `somalipin-${profile.magaca.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 }, // Maximum image quality
      html2canvas: { 
        scale: 4, // Ultra-high resolution (4x pixel density)
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 15000, // Ensure images load before capture
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        precision: 16 // High precision for placement
      }
    };

    try {
      // Use the worker API to ensure the export happens in an isolated frame for quality
      await h2p().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Waan ka xunnahay, qalad ayaa dhacay xilligii PDF-ka la samaynayay.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Navbar / Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 no-print">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
            <i className="fas fa-fingerprint"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">SOMALIPIN</h1>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">AI Engine v1.0</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <p className="text-gray-500 text-sm font-medium">U badal sawirada profiles dhameystiran</p>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-12">
        {/* Step 1: Upload */}
        {status === AppStatus.IDLE && !profile && (
          <div className="text-center space-y-8 no-print">
            <div className="max-w-xl mx-auto">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Aqoonso Dadka Saameynta Leh <br/> <span className="text-blue-600">adigoo sawir kaliya isticmaalaya</span>
              </h2>
              <p className="text-gray-500 text-lg">
                Soo geli sawirka xubinta, AI-gayagu wuxuu si toos ah u soo saari doonaa xogta isagoo u qaabaynaya Template-ka rasmiga ah ee Somalipin.
              </p>
            </div>

            <div 
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all 
                ${imagePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-white hover:shadow-xl'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-64 rounded-2xl shadow-md border-4 border-white" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600" onClick={(e) => { e.stopPropagation(); reset(); }}>
                    <i className="fas fa-times"></i>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                    <i className="fas fa-cloud-arrow-up text-3xl"></i>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-700">Soo geli sawirka xubinta</p>
                    <p className="text-gray-400 text-sm mt-1">PNG, JPG ilaa 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <button 
                onClick={processImage}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Bilow Farsameynta <i className="fas fa-bolt ml-2"></i>
              </button>
            )}
          </div>
        )}

        {/* Step 2: Processing */}
        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-pulse no-print">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-robot text-blue-600 text-2xl"></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">AI Engine: Akhrinta sawirka...</h3>
              <p className="text-gray-500 mt-2">Xogta waa la falanqeynayaa, fadlan sug daqiiqad.</p>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {status === AppStatus.SUCCESS && profile && (
          <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center bg-green-50 border border-green-100 p-4 rounded-2xl no-print">
              <div className="flex items-center text-green-700 font-bold">
                <i className="fas fa-circle-check text-xl mr-3"></i>
                Farsameynta waa lagu guuleystay! Wax ka bedel xogta haddii loo baahdo.
              </div>
              <button 
                onClick={reset}
                className="text-gray-500 hover:text-blue-600 font-bold text-sm flex items-center"
              >
                <i className="fas fa-rotate-left mr-2"></i> Isku day mid kale
              </button>
            </div>
            
            <div className="w-full flex justify-center">
               <ProfileCard 
                innerRef={cardRef}
                profile={profile} 
                imagePreview={imagePreview} 
                onUpdate={handleProfileUpdate}
                onImageUpdate={setImagePreview}
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 no-print">
              <button 
                className="flex-1 min-w-[150px] bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center"
                onClick={() => window.print()}
              >
                <i className="fas fa-print mr-2"></i> Daabaco
              </button>
              
              <button 
                className={`flex-1 min-w-[150px] bg-red-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={downloadPDF}
                disabled={isExporting}
              >
                <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i> 
                {isExporting ? 'Deyrinaya...' : 'Degso PDF'}
              </button>

              <button 
                className="flex-1 min-w-[150px] bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `somalipin-${profile.magaca.replace(/\s+/g, '-').toLowerCase()}.json`;
                  a.click();
                }}
              >
                <i className="fas fa-download mr-2"></i> Keydi JSON
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border-2 border-red-100 p-12 rounded-3xl text-center space-y-6 max-w-xl mx-auto no-print">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-circle-exclamation text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-red-900">Cillad Farsamo</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={reset}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
            >
              Isku day markale
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 border-t border-gray-100 w-full text-center no-print">
        <p className="text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Somalipin AI Engine. Dhammaan xuquuqda waa la dhowray.
        </p>
      </footer>
    </div>
  );
};

export default App;
