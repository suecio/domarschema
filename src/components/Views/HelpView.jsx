import React from 'react';
import { ArrowLeft, BookOpen, MessageCircle, Mail, Code, Share2, UserPlus, Search, CheckCircle, Info, Send, RefreshCw } from 'lucide-react';

export default function HelpView({
  t, setView, helpTab, setHelpTab, copyGuideLink,
  contactName, setContactName, contactEmail, setContactEmail,
  contactSubject, setContactSubject, contactMessage, setContactMessage,
  contactStatus, setContactStatus, handleContactSubmit,
  readmeLoading, readmeContent, renderMarkdown
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button 
        onClick={() => { setView('schedule'); }} 
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setHelpTab('guide')}
            className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'guide' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-4 h-4" /> {t.guide}
          </button>
          <button 
            onClick={() => setHelpTab('faq')}
            className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'faq' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <MessageCircle className="w-4 h-4" /> {t.faq}
          </button>
          <button 
            onClick={() => setHelpTab('contact')}
            className={`min-w-[140px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'contact' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Mail className="w-4 h-4" /> {t.contactUs}
          </button>
          <button 
            onClick={() => setHelpTab('about')}
            className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'about' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Code className="w-4 h-4" /> {t.about}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {helpTab === 'guide' && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{t.guide}</h2>
                <p className="text-slate-500 font-medium mt-2">Hur du kopplar ditt konto till din domarprofil</p>
                
                <button 
                  onClick={copyGuideLink}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-colors shadow-sm active:scale-95"
                >
                  <Share2 className="w-4 h-4" /> {t.shareGuide}
                </button>
              </div>

              <div className="grid gap-6">
                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t.guideStep1Title}</h3>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep1Desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t.guideStep2Title}</h3>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep2Desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-md shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">{t.guideStep3Title}</h3>
                      <p className="text-blue-800 font-medium leading-relaxed mt-1">{t.guideStep3Desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                      <Info className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t.guideStep4Title}</h3>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep4Desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {helpTab === 'faq' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{t.faq}</h2>
              </div>

              <div className="space-y-4">
                {[
                  { q: t.faq1Q, a: t.faq1A },
                  { q: t.faq2Q, a: t.faq2A },
                  { q: t.faq3Q, a: t.faq3A },
                  { q: t.faq4Q, a: t.faq4A },
                  { q: t.faq5Q, a: t.faq5A }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-black uppercase text-slate-800 mb-2">{faq.q}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {helpTab === 'contact' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{t.contactUs}</h2>
                <p className="text-slate-500 font-medium mt-2">{t.contactDesc}</p>
              </div>

              {contactStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-green-800 mb-2">{t.msgSentTitle}</h3>
                  <p className="text-green-700 font-medium mb-6">{t.msgSentDesc}</p>
                  <button 
                    onClick={() => setContactStatus('idle')} 
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-green-700 transition-colors shadow-md"
                  >
                    {t.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label>
                      <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label>
                      <input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.subject}</label>
                    <input type="text" required value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.message}</label>
                    <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={contactStatus === 'sending'} 
                      className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {contactStatus === 'sending' ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> {t.sending}</>
                      ) : (
                        <><Send className="w-4 h-4" /> {t.sendMsg}</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {helpTab === 'about' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">{t.about}</h2>
              </div>
              
              <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">
                {readmeLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-bold">{t.loadingReadme}</p>
                  </div>
                ) : (
                  <div className="markdown-body text-sm sm:text-base">
                    {renderMarkdown(readmeContent)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
