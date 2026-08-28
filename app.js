const tg=window.Telegram?.WebApp;tg?.ready();tg?.expand();
const API='';let lang=localStorage.getItem('asoland_lang')||'fa',currentFile=null,recorder=null,recordChunks=[];localStorage.setItem('asoland_visit_count',String((Number(localStorage.getItem('asoland_visit_count'))||0)+1));
let theme=localStorage.getItem('asoland_theme')||((window.Telegram?.WebApp?.colorScheme==='light')?'light':'dark');
const T={fa:{welcome:'دستیار هوشمند شما',hello:'سلام 👋',choose:'امروز چه کاری می‌خواهی انجام بدهی؟',aiChat:'چت با هوش مصنوعی',aiHint:'پیامت را بنویس و پاسخ را در همان زبان انتخابی بگیر.',home:'خانه',ai:'هوش مصنوعی',tools:'ابزارها',profile:'حساب من',working:'در حال پردازش...',error:'خطایی رخ داد. دوباره تلاش کن.',touch:'ورود',file:'فایل‌خوان هوشمند',teacher:'معلم زبان',vision:'حل سؤال از عکس',prices:'قیمت‌ها',weather:'آب‌وهوا',text:'ابزارهای متنی',more:'سایر امکانات',fortune:'فال روزانه',calculator:'محاسبه‌گر پیشرفته',currency:'تبدیل ارز',calendar:'تقویم امروز',news:'اخبار',student:'ابزار دانشجویی',chart:'نمودار قیمت',alerts:'هشدار قیمت',general:'عمومی',tech:'فناوری',economy:'اقتصاد',crypto:'کریپتو',education:'آموزش',calcPlaceholder:'مثال: (25+7)*3 یا x^2-5*x+6=0',calculate:'محاسبه',currencyPlaceholder:'مثال: 100 دلار به تومان',convert:'تبدیل',studentPlaceholder:'سؤال درسی را بنویس...',solve:'حل کن',upload:'انتخاب فایل',uploadHint:'PDF، DOCX یا TXT تا ۲۵ مگابایت',summary:'خلاصه‌سازی',notes:'استخراج نکات',question:'سؤال از فایل',quiz:'ساخت آزمون',flashcards:'فلش‌کارت',translate:'ترجمه',ask:'سؤال خود را بنویس...',send:'ارسال',teacherPlaceholder:'جمله یا درخواستت را بنویس...',visionHint:'عکس سؤال یا متن را انتخاب کن.',chooseImage:'انتخاب عکس',result:'نتیجه',level:'سطح',beginner:'مبتدی',intermediate:'متوسط',advanced:'پیشرفته',conversation:'گفت‌وگو',correct:'اصلاح جمله',vocabulary:'واژگان',grammar:'گرامر',voice:'ویس به متن',record:'ضبط ویس',stop:'توقف ضبط',auto:'تشخیص خودکار',translateText:'ترجمه متن',summarize:'خلاصه‌سازی متن',sticker:'ساخت استیکر',stickerSent:'استیکر ساخته و به ربات ارسال شد',stickerReady:'استیکر آماده شد',stickerText:'متن استیکر',stickerPhoto:'استیکر با عکس',qr:'ساخت QR',short:'کوتاه‌کننده لینک',download:'دانلود رسانه',music:'جستجوی آهنگ',lyrics:'متن آهنگ',subtitle:'ساخت زیرنویس',config:'کانفیگ رایگان',fancy:'زیباسازی متن',reminder:'یادآوری',protocol:'پروتکل',search:'جستجو',downloadMp3:'دانلود MP3',quality:'کیفیت',srt:'دانلود SRT',video:'دانلود ویدیو',source:'لینک منبع',profileText:'اطلاعات حساب تلگرام',notAuth:'بدون ورود تلگرام',auth:'احراز هویت شد',user:'کاربر',delete:'حذف',create:'ساخت',target:'زبان مقصد',fa:'فارسی',ckb:'کوردی',en:'انگلیسی',fileReady:'فایل آماده است',recordHint:'برای شروع ضبط بزن.',noMedia:'رسانه‌ای انتخاب نشده است'},ckb:{welcome:'یاریدەدەری زیرەکی تۆ',hello:'سڵاو 👋',choose:'ئەمڕۆ چی دەتەوێت بکەیت؟',aiChat:'گفتوگۆ لەگەڵ زیرەکی دەستکرد',aiHint:'پەیامەکەت بنووسە و وەڵام بە هەمان زمان وەربگرە.',home:'ماڵەوە',ai:'زیرەکی دەستکرد',tools:'ئامرازەکان',profile:'هەژمارەکەم',working:'لە پرۆسەکردندایە...',error:'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدە.',touch:'کردنەوە',file:'خوێنەری زیرەکی فایل',teacher:'مامۆستای زمان',vision:'چارەسەری پرسیار لە وێنە',prices:'نرخەکان',weather:'کەش و هەوا',text:'ئامرازەکانی دەق',more:'ئامرازەکانی تر',fortune:'بەختی ڕۆژانە',calculator:'ژمێرکاری پێشکەوتوو',currency:'گۆڕینی دراو',calendar:'ڕۆژمێری ئەمڕۆ',news:'هەواڵ',student:'ئامرازە خوێندنگەییەکان',chart:'هێڵکاری نرخ',alerts:'ئاگاداری نرخ',general:'گشتی',tech:'تەکنەلۆجیا',economy:'ئابووری',crypto:'کریپتۆ',education:'فێرکاری',calcPlaceholder:'نموونە: (25+7)*3 یان x^2-5*x+6=0',calculate:'ژمێرکردن',currencyPlaceholder:'نموونە: 100 دۆلار بۆ تمەن',convert:'گۆڕین',studentPlaceholder:'پرسیاری خوێندنگە بنووسە...',solve:'چارەسەر بکە',upload:'هەڵبژاردنی فایل',uploadHint:'PDF، DOCX یان TXT تا ٢٥ مێگابایت',summary:'کورتەکردنەوە',notes:'دەرهێنانی خاڵەکان',question:'پرسیار لە فایل',quiz:'دروستکردنی تاقیکردنەوە',flashcards:'فلەش‌کارت',translate:'وەرگێڕان',ask:'پرسیارەکەت بنووسە...',send:'ناردن',teacherPlaceholder:'ڕستە یان داواکارییەکەت بنووسە...',visionHint:'وێنەی پرسیار یان دەق هەڵبژێرە.',chooseImage:'هەڵبژاردنی وێنە',result:'ئەنجام',level:'ئاست',beginner:'سەرەتایی',intermediate:'ناوەندی',advanced:'پێشکەوتوو',conversation:'گفتوگۆ',correct:'ڕاستکردنەوەی ڕستە',vocabulary:'وشەکان',grammar:'ڕێزمان',voice:'دەنگ بۆ دەق',record:'تۆمارکردنی دەنگ',stop:'وەستاندنی تۆمار',auto:'دۆزینەوەی خۆکار',translateText:'وەرگێڕانی دەق',summarize:'کورتەکردنەوەی دەق',sticker:'دروستکردنی ستیکەر',stickerSent:'ستیکەر دروستکرا و بۆ بۆتەکە نێردرا',stickerReady:'ستیکەر ئامادەیە',stickerText:'دەقی ستیکەر',stickerPhoto:'ستیکەر بە وێنە',qr:'دروستکردنی QR',short:'کورتکردنەوەی بەستەر',download:'داگرتنی میدیا',music:'گەڕانی گۆرانی',lyrics:'دەقی گۆرانی',subtitle:'دروستکردنی ژێرنووس',config:'کۆنفیگی بەخۆڕایی',fancy:'جوانکردنی دەق',reminder:'بیرخستنەوە',protocol:'پرۆتۆکۆڵ',search:'گەڕان',downloadMp3:'داگرتنی MP3',quality:'کوالێتی',srt:'داگرتنی SRT',video:'داگرتنی ڤیدیۆ',source:'بەستەری سەرچاوە',profileText:'زانیاری هەژماری تەلەگرام',notAuth:'بەبێ چوونەژوورەوەی تەلەگرام',auth:'پشتڕاستکراوەتەوە',user:'بەکارهێنەر',delete:'سڕینەوە',create:'دروستکردن',target:'زمانی مەبەست',fa:'فارسی',ckb:'کوردی',en:'ئینگلیزی',fileReady:'فایل ئامادەیە',recordHint:'بۆ دەستپێکردنی تۆمارکردن کلیک بکە.',noMedia:'هیچ میدیایەک هەڵنەبژێردراوە'}};
const T_en={language:'Language',searchTools:'Search features...',noResults:'No feature found',quickActions:'Quick access',above:'Above',below:'Below',summarize:'Summarize',alertSymbolPlaceholder:'BTC / USD / Gold',urlPlaceholder:'https://...',darkMode:'Dark mode',lightMode:'Light mode',browserNoRecord:'Your browser does not support audio recording.',qrPlaceholder:'URL or text',downloadQr:'Download QR',downloadWord:'Download Word',downloadPdf:'Download PDF',downloadChart:'Download Chart',downloadCompressedImage:'Download compressed image',downloadCompressedVideo:'Download compressed video',downloadImage:'Download compressed image',downloadVideo:'Download compressed video',photoPdfTitle:'Photos to PDF',textWordTitle:'Text to Word',compressImageTitle:'Compress image',compressVideoTitle:'Compress video',qrUrlText:'URL or text',chartDownload:'Download chart',fortuneFriend:'Friend',welcome:'Your smart assistant',hello:'Hello 👋',choose:'What would you like to do today?',home:'Home',ai:'AI',tools:'Tools',profile:'My Account',working:'Processing...',error:'Something went wrong. Please try again.',touch:'Open',file:'Smart File Reader',teacher:'Language Teacher',vision:'Solve from Image',prices:'Prices',weather:'Weather',text:'Text Tools',more:'More Features',aiChat:'AI Chat',aiHint:'Chat with the assistant in your selected language.',fortune:'Daily Fortune',calculator:'Advanced Calculator',currency:'Currency Converter',calendar:"Today's Calendar",news:'News',student:'Student Tools',chart:'Price Chart',alerts:'Price Alerts',general:'General',tech:'Technology',economy:'Economy',crypto:'Crypto',education:'Education',calcPlaceholder:'Example: (25+7)*3 or x^2-5*x+6=0',calculate:'Calculate',currencyPlaceholder:'Example: 100 USD to toman',convert:'Convert',studentPlaceholder:'Write your study question...',solve:'Solve',upload:'Choose File',uploadHint:'PDF, DOCX or TXT up to 25 MB',summary:'Summarize',notes:'Extract Notes',question:'Ask from File',quiz:'Create Quiz',flashcards:'Flashcards',translate:'Translate',ask:'Write your question...',send:'Send',teacherPlaceholder:'Write a sentence or request...',visionHint:'Choose a question or text image.',chooseImage:'Choose Image',result:'Result',level:'Level',beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced',conversation:'Conversation',correct:'Correct Sentence',vocabulary:'Vocabulary',grammar:'Grammar',voice:'Voice to Text',record:'Record Voice',stop:'Stop Recording',auto:'Auto Detect',translateText:'Translate Text',summarizeText:'Summarize Text',sticker:'Create Sticker',stickerSent:'Sticker created and sent to the bot',stickerReady:'Sticker is ready',stickerText:'Sticker Text',stickerPhoto:'Sticker with Photo',qr:'Create QR',short:'Shorten Link',download:'Media Download',music:'Music Search',lyrics:'Lyrics',subtitle:'Create Subtitles',config:'Free Config',fancy:'Fancy Text',reminder:'Reminder',protocol:'Protocol',search:'Search',downloadMp3:'Download MP3',quality:'Quality',srt:'Download SRT',video:'Download Video',source:'Source Link',profileText:'Telegram Account',notAuth:'Telegram login unavailable',auth:'Authenticated',user:'User',delete:'Delete',create:'Create',target:'Target Language',fa:'Persian',ckb:'Kurdish',en:'English',fileReady:'File is ready',recordHint:'Tap record to start.',noMedia:'No media selected',chooseCity:'Enter a city name',compressImage:'Compress Image',compressVideo:'Compress Video',photoPdf:'Photos to PDF',textWord:'Text to Word',clock:'Clock',stickerBg:'Background',stickerFg:'Text Color',downloadSticker:'Download Sticker',musicPlaceholder:'Song or artist name',artist:'Artist',songTitle:'Song title',empty:'Nothing yet',userName:'Your name',open:'Open',cancel:'Cancel'};Object.assign(T,{en:T_en});

Object.assign(T.fa,{language:'زبان',searchTools:'جستجو در امکانات...',noResults:'امکانی پیدا نشد',quickActions:'دسترسی سریع',darkMode:'حالت شب',lightMode:'حالت روز',browserNoRecord:'مرورگر ضبط صدا را پشتیبانی نمی‌کند',qrPlaceholder:'URL یا متن',downloadQr:'دانلود QR',downloadWord:'دانلود Word',downloadChart:'دانلود نمودار',downloadCompressedImage:'دانلود عکس فشرده',downloadCompressedVideo:'دانلود ویدیوی فشرده',alertSymbolPlaceholder:'BTC / USD / Gold',urlPlaceholder:'https://...',summarizeText:'خلاصه‌سازی متن',chooseCity:'نام شهر را وارد کن',compressImage:'فشرده‌سازی عکس',compressVideo:'فشرده‌سازی ویدیو',photoPdf:'عکس به PDF',textWord:'متن به Word',clock:'ساعت',stickerBg:'پس‌زمینه',stickerFg:'رنگ متن',downloadSticker:'دانلود استیکر',musicPlaceholder:'نام آهنگ یا خواننده',artist:'خواننده',songTitle:'نام آهنگ',empty:'چیزی وجود ندارد',userName:'نام شما',open:'باز کردن',cancel:'لغو',above:'بیشتر از',below:'کمتر از'});
Object.assign(T.ckb,{language:'زمان',searchTools:'گەڕان لە ئامرازەکان...',noResults:'هیچ ئامرازێک نەدۆزرایەوە',quickActions:'دەستگەیشتنی خێرا',darkMode:'دۆخی شەو',lightMode:'دۆخی ڕۆژ',browserNoRecord:'وێبگەڕەکەت تۆمارکردنی دەنگ پشتگیری ناکات.',qrPlaceholder:'بەستەر یان دەق',downloadQr:'داگرتنی QR',downloadWord:'داگرتنی Word',downloadPdf:'داگرتنی PDF',downloadChart:'داگرتنی هێڵکاری',downloadCompressedImage:'داگرتنی وێنەی پەستاندراو',downloadCompressedVideo:'داگرتنی ڤیدیۆی پەستاندراو',downloadImage:'داگرتنی وێنەی پەستاندراو',downloadVideo:'داگرتنی ڤیدیۆی پەستاندراو',photoPdfTitle:'وێنە بۆ PDF',textWordTitle:'دەق بۆ Word',compressImageTitle:'پەستاندنی وێنە',compressVideoTitle:'پەستاندنی ڤیدیۆ',qrUrlText:'بەستەر یان دەق',chartDownload:'داگرتنی هێڵکاری',fortuneFriend:'هاوڕێ',summarizeText:'کورتەکردنەوەی دەق',chooseCity:'ناوی شار بنووسە',compressImage:'پەستاندنی وێنە',compressVideo:'پەستاندنی ڤیدیۆ',photoPdf:'وێنە بۆ PDF',textWord:'دەق بۆ Word',clock:'کات',stickerBg:'پاشبنەما',stickerFg:'ڕەنگی دەق',downloadSticker:'داگرتنی ستیکەر',musicPlaceholder:'ناوی گۆرانی یان گۆرانیبێژ',artist:'گۆرانیبێژ',songTitle:'ناوی گۆرانی',empty:'هیچ نییە',userName:'ناوی تۆ',open:'کردنەوە',cancel:'هەڵوەشاندنەوە',above:'زیاتر لە',below:'کەمتر لە'});
Object.assign(T.fa,{visits:'بازدید',toolsSubtitle:'همه ابزارهای AsoLand، مرتب و آماده استفاده',quickSubtitle:'دسترسی فوری به ابزارهای محبوب',catAll:'همه',catAI:'هوشمند',catCreate:'ساخت و تبدیل',catText:'متن و صدا',catInfo:'اطلاعات',favorite:'علاقه‌مندی',recent:'آخرین استفاده‌ها',voice:'ویس به متن',sticker:'ساخت استیکر',download:'دانلود'});Object.assign(T.ckb,{visits:'سەردان',toolsSubtitle:'هەموو ئامرازەکانی AsoLand، ڕێکخراو و ئامادەن',quickSubtitle:'دەستگەیشتنی خێرا بە ئامرازە بەکارهاتووەکان',catAll:'هەموو',catAI:'زیرەک',catCreate:'دروستکردن و گۆڕین',catText:'دەق و دەنگ',catInfo:'زانیاری',favorite:'دڵخواز',recent:'دوایین بەکارهێنان',voice:'دەنگ بۆ دەق',sticker:'دروستکردنی ستیکەر',download:'داگرتن'});Object.assign(T.fa,{heroAiTitle:'دستیار AsoLand',heroAiHint:'هر چیزی می‌خواهی بگو، راهش را پیدا می‌کنیم'});Object.assign(T.ckb,{heroAiTitle:'یاریدەدەری AsoLand',heroAiHint:'هەر شتێکت دەوێت بڵێ، ڕێگاکەی دەدۆزینەوە'});Object.assign(T.en,{visits:'Visits',heroAiTitle:'AsoLand Assistant',heroAiHint:'Tell me what you need and I’ll find the best tool',toolsSubtitle:'Everything you need, organized and ready',quickSubtitle:'Instant access to popular tools',catAll:'All',catAI:'AI',catCreate:'Create & Convert',catText:'Text & Voice',catInfo:'Insights',favorite:'Favorite',recent:'Recent',voice:'Voice to Text',sticker:'Create Sticker',download:'Download'});Object.assign(T.fa,{dashTitle:'حساب AsoLand',dashSubtitle:'امتیازها و جایزه‌های امروزت',dashCoins:'سکه',dashLevel:'سطح',dashStreak:'استریک',claimReward:'دریافت جایزه',rewardClaimed:'جایزه امروز دریافت شد',proSoon:'AsoLand Pro به‌زودی',continueTitle:'آخرین استفاده',continueEmpty:'هنوز ابزاری استفاده نکردی',popularTitle:'پیشنهاد امروز',popularText:'یک ابزار را امتحان کن'});Object.assign(T.ckb,{dashTitle:'هەژماری AsoLand',dashSubtitle:'خاڵ و دیارییەکانی ئەمڕۆت',dashCoins:'درۆ',dashLevel:'ئاست',dashStreak:'بەردەوامی',claimReward:'وەرگرتنی دیاری',rewardClaimed:'دیاریی ئەمڕۆ وەرگیرا',proSoon:'AsoLand Pro بەم زووانە',continueTitle:'دوایین بەکارهێنان',continueEmpty:'هێشتا هیچ ئامرازێکت بەکارنەهێناوە',popularTitle:'پێشنیاری ئەمڕۆ',popularText:'ئامرازێک تاقی بکەرەوە'});Object.assign(T.en,{dashTitle:'AsoLand Account',dashSubtitle:'Your points and daily rewards',dashCoins:'Coins',dashLevel:'Level',dashStreak:'Streak',claimReward:'Claim reward',rewardClaimed:'Today’s reward claimed',proSoon:'AsoLand Pro coming soon',continueTitle:'Last used',continueEmpty:'You haven’t used a tool yet',popularTitle:'Today’s pick',popularText:'Try one of our tools'});const t=k=>T[lang]?.[k]??T.fa[k]??k;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function richText(s){let x=esc(s);x=x.replace(/&lt;b&gt;/gi,'<b>').replace(/&lt;\/b&gt;/gi,'</b>').replace(/&lt;br\s*\/??&gt;/gi,'<br>');return x.replace(/\n/g,'<br>')}
function telegramWebApp(){return window.Telegram?.WebApp||tg||null}
function currentUser(){return telegramWebApp()?.initDataUnsafe?.user||null}

// Telegram can occasionally populate initDataUnsafe a moment after the WebApp
// is initialized. Never hide the mini profile in that case; keep a safe fallback
// and refresh it a few times so users with a delayed Telegram payload also see it.
function renderMiniUser(){
  const el=document.getElementById('miniUser');
  if(!el)return;
  const u=currentUser();
  const name=(u?.first_name||u?.last_name||'AsoLand').trim()||'AsoLand';
  const initial=(name.replace(/\s+/g,'').slice(0,1)||'A').toUpperCase();
  const avatar=u?.photo_url
    ? `<img src="${esc(u.photo_url)}" alt="${esc(name)}" loading="eager">`
    : `<span class="mini-avatar-fallback">${esc(initial)}</span>`;
  el.hidden=false;
  el.innerHTML=`${avatar}<span>${esc(name)}</span>`;
  el.setAttribute('aria-label',name);
}


// Wait briefly for Telegram's signed initData. Some Telegram WebViews populate it
// after the first JavaScript tick; without this retry the app could falsely show
// an unauthenticated account and reject the daily reward.
async function getInitDataWithRetry(maxTries=24,delay=250){
  const webApp=telegramWebApp();
  try{webApp?.ready?.();webApp?.expand?.()}catch(_){}
  for(let i=0;i<maxTries;i++){
    const value=(webApp?.initData||window.Telegram?.WebApp?.initData||'').trim();
    if(value)return value;
    // Some Android/desktop Telegram clients only populate initData once the
    // WebView tab actually becomes visible/focused, not on first paint.
    if(document.hidden){
      await new Promise(resolve=>{
        const onVis=()=>{document.removeEventListener('visibilitychange',onVis);resolve()};
        document.addEventListener('visibilitychange',onVis);
        setTimeout(()=>{document.removeEventListener('visibilitychange',onVis);resolve()},delay*4);
      });
    }else{
      await new Promise(resolve=>setTimeout(resolve,delay));
    }
  }
  return '';
}

// Distinguishes "the Telegram bridge script never loaded" (e.g. opened
// outside Telegram, or telegram.org was unreachable) from "we're inside
// Telegram but this tab wasn't launched as a signed Web App" (e.g. opened
// via a plain shared link/button instead of the menu button or a
// web_app-type button) so the user gets an accurate message instead of a
// generic "not authenticated" toast either way.
function authFailureReason(){
  if(!window.Telegram||!window.Telegram.WebApp) return 'no-bridge';
  return 'no-signed-data';
}
const AUTH_MSG={
  fa:{'no-bridge':'اتصال به تلگرام برقرار نشد. لطفاً از داخل اپلیکیشن تلگرام (نه مرورگر) وارد شو.','no-signed-data':'این صفحه از راه درست باز نشده. از دکمهٔ منوی ربات در تلگرام وارد AsoLand شو.'},
  ckb:{'no-bridge':'پەیوەندی لەگەڵ تەلەگرام دروست نەبوو. لە ناو ئەپی تەلەگرامەوە بیکەرەوە، نەک بڕاوزەر.','no-signed-data':'ئەم پەڕەیە بە ڕێگای ڕاست نەکراوەتەوە. لە دوگمەی مینیوی بۆتەکە لە تەلەگرام AsoLand بکەرەوە.'},
  en:{'no-bridge':'Could not connect to Telegram. Please open this inside the Telegram app, not a browser.','no-signed-data':'This page wasn\u2019t opened the right way. Open AsoLand from the bot\u2019s menu button in Telegram.'}
};
function authFailureMessage(){
  const state=accountState.authState;
  const map={
    missing: AUTH_MSG[lang]?.['no-signed-data'],
    expired: lang==='fa'?'نشست Telegram منقضی شده؛ Mini App را دوباره باز کن.':lang==='ckb'?'دانیشتنەوەی Telegram بەسەرچووە؛ Mini App دووبارە بکەرەوە.':'Your Telegram session expired; reopen the Mini App.',
    invalid_signature: lang==='fa'?'اعتبارسنجی Telegram ناموفق بود؛ Mini App را از منوی ربات دوباره باز کن.':lang==='ckb'?'پشتڕاستکردنەوەی Telegram سەرکەوتوو نەبوو؛ Mini App لە مینیوی بۆتەکە دووبارە بکەرەوە.':'Telegram validation failed; reopen the Mini App from the bot menu.',
    server_not_configured: lang==='fa'?'تنظیمات Telegram روی سرور کامل نیست.':lang==='ckb'?'ڕێکخستنەکانی Telegram لەسەر سێرڤەر تەواو نییە.':'Telegram server configuration is incomplete.'
  };
  return map[state]||AUTH_MSG[lang]?.[authFailureReason()]||t('notAuth');
}

function refreshMiniUser(){
  renderMiniUser();
  let tries=0;
  const timer=setInterval(()=>{
    renderMiniUser();
    if(currentUser()||++tries>=20)clearInterval(timer);
  },250);
}

function toast(s){const x=document.querySelector('#toast');x.textContent=s;x.style.display='block';clearTimeout(toast.tm);toast.tm=setTimeout(()=>x.style.display='none',2800)}
async function api(path,opt={}){
  const webApp=telegramWebApp();
  const initData=(webApp?.initData||'').trim();
  const options={...opt,headers:{...(opt.headers||{})}};
  if(initData) options.headers['X-Telegram-Init-Data']=initData;
  const r=await fetch(API+path,options);
  let d={};try{d=await r.json()}catch{}
  if(!r.ok){const err=new Error(d.detail||d.message||t('error'));err.status=r.status;err.authState=d.authState;throw err;}
  return d;
}
function panel(id){
  ['chatPanel','filePanel','toolPanel','profilePanel'].forEach(x=>{
    const el=document.getElementById(x);
    if(el) el.style.display=x===id?'block':'none';
  });
  telegramWebApp()?.BackButton?.show();
  requestAnimationFrame(()=>{
    const el=document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function home(){['chatPanel','filePanel','toolPanel','profilePanel'].forEach(x=>document.getElementById(x).style.display='none');telegramWebApp()?.BackButton?.hide();document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='home'));}
function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';document.body.dataset.lang=lang;welcome.textContent=t('welcome');hello.textContent=t('hello');choose.textContent=t('choose');navHome.textContent=t('home');navAi.textContent=t('ai');navTools.textContent=t('tools');navProfile.textContent=t('profile');document.getElementById('heroAiTitle')&&(document.getElementById('heroAiTitle').textContent=t('heroAiTitle'));document.getElementById('heroAiHint')&&(document.getElementById('heroAiHint').textContent=t('heroAiHint'));langBtnText();renderDashboard();renderTools()}
function langBtnText(){const b=document.getElementById('lang');if(!b)return;b.textContent=lang==='fa'?'کوردی':(lang==='ckb'?'English':'فارسی');b.title=lang==='fa'?'Change language':lang==='ckb'?'گۆڕینی زمان':'تغییر زبان'}
const tools=[['🤖','aiChat','aiHint'],['📚','file','file'],['👨‍🏫','teacher','teacher'],['🖼️','vision','vision'],['💰','prices','prices'],['🌤️','weather','weather'],['📝','text','text'],['⚙️','more','more']];
const desc={fa:{aiChat:'گفت‌وگوی سریع با دستیار',file:'خلاصه، سؤال و فلش‌کارت',teacher:'تمرین و اصلاح زبان',vision:'حل سؤال از تصویر',prices:'طلا، ارز و دیجیتال',weather:'پیش‌بینی و وضعیت هوا',text:'ترجمه، خلاصه و متن',more:'دانلود، استیکر، موسیقی و ابزارها'},ckb:{aiChat:'گفتوگۆی خێرا',file:'کورتە و پرسیار',teacher:'ڕاهێنان و ڕاستکردنەوە',vision:'چارەسەری پرسیار لە وێنە',prices:'زێڕ، دراو و کریپتۆ',weather:'پێشبینی و دۆخی کەشوهەوا',text:'وەرگێڕان و ئامرازەکانی دەق',more:'داگرتن، ستیکەر، گۆرانی و ئامرازەکان'},en:{aiChat:'Fast conversation with your assistant',file:'Summaries, questions and flashcards',teacher:'Practice and improve your language',vision:'Solve questions from images',prices:'Gold, FX and crypto',weather:'Forecast and live conditions',text:'Translation, summaries and text tools',more:'Downloads, stickers, music and utilities'}};
const TOOL_META={
 aiChat:{cat:'ai',emoji:'🤖'},file:{cat:'ai',emoji:'📚'},teacher:{cat:'ai',emoji:'👨‍🏫'},vision:{cat:'ai',emoji:'🖼️'},
 prices:{cat:'info',emoji:'💰'},weather:{cat:'info',emoji:'🌤️'},text:{cat:'text',emoji:'📝'},more:{cat:'create',emoji:'🧰'}
};
const favKey='asoland_favorites_v1',recentKey='asoland_recent_v1';
let favorites=JSON.parse(localStorage.getItem(favKey)||'[]');
let recent=JSON.parse(localStorage.getItem(recentKey)||'[]');
let accountState={authenticated:false,coins:0,xp:0,level:1,streak:0,isPro:false,referralCode:''};
try{
  const cached=JSON.parse(localStorage.getItem('asoland_account_cache_v1')||'null');
  const liveId=String(currentUser()?.id||'');
  if(cached?.userId && liveId && String(cached.userId)===liveId) accountState={...accountState,...cached};
}
catch(_){ localStorage.removeItem('asoland_account_cache_v1'); }
function saveLists(){localStorage.setItem(favKey,JSON.stringify(favorites));localStorage.setItem(recentKey,JSON.stringify(recent));}
async function syncAccount(){
  const initData=await getInitDataWithRetry(24,250);
  if(!initData){
    accountState={authenticated:false,coins:0,xp:0,level:1,streak:0,isPro:false,referralCode:'',authState:'missing'};
    localStorage.removeItem('asoland_account_cache_v1');
    renderDashboard();
    return accountState;
  }
  try{
    const d=await api('/api/account?initData='+encodeURIComponent(initData));
    if(d?.authenticated){
      accountState={...accountState,...d,authenticated:true};
      localStorage.setItem('asoland_account_cache_v1',JSON.stringify(accountState));
    }else{
      accountState={authenticated:false,coins:0,xp:0,level:1,streak:0,isPro:false,referralCode:'',authState:d?.authState||'unknown'};
      localStorage.removeItem('asoland_account_cache_v1');
    }
  }catch(e){
    accountState={authenticated:false,coins:0,xp:0,level:1,streak:0,isPro:false,referralCode:'',authState:e.authState||'unknown'};
    localStorage.removeItem('asoland_account_cache_v1');
  }
  renderDashboard();
  return accountState;
}

function renderDashboard(){
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=String(val??'—')};
  set('dashTitle',t('dashTitle')); set('dashSubtitle',t('dashSubtitle'));
  set('dashCoins',accountState.authenticated?accountState.coins:0);
  set('dashLevel',accountState.authenticated?accountState.level:1);
  set('dashStreak',accountState.authenticated?accountState.streak:0);
  set('dashCoinsLabel',t('dashCoins')); set('dashLevelLabel',t('dashLevel')); set('dashStreakLabel',t('dashStreak'));
  const daily=document.getElementById('dailyBtn');
  if(daily){const claimed=!!accountState.claimed;daily.disabled=claimed;daily.classList.toggle('is-claimed',claimed);daily.querySelector('span').textContent=claimed?t('rewardClaimed'):t('claimReward');daily.onclick=claimDailyReward;}
  const pro=document.getElementById('proBtn');
  if(pro){pro.querySelector('span').textContent=accountState.isPro?'Pro':t('proSoon');pro.onclick=()=>toast(t('proSoon'));}
  const last=recent[0];
  set('continueTitle',t('continueTitle'));
  set('continueText',last?t(last):t('continueEmpty'));
  const cb=document.getElementById('continueBtn'); if(cb)cb.onclick=()=>last?openTool(last):morePanel();
  const popular=recent[1]||recent[0]||'aiChat';
  set('popularTitle',t('popularTitle')); set('popularText',t(popular)||t('popularText'));
  const pb=document.getElementById('popularBtn'); if(pb)pb.onclick=()=>openTool(popular);
}

async function claimDailyReward(){
  const initData=await getInitDataWithRetry(24,250);
  if(!initData){accountState={...accountState,authenticated:false,authState:'missing'};renderDashboard();toast(authFailureMessage());return;}
  try{
    const current=await api('/api/account?initData='+encodeURIComponent(initData));
    if(!current?.authenticated){
      accountState={authenticated:false,coins:0,xp:0,level:1,streak:0,isPro:false,referralCode:'',authState:current?.authState||'unknown'};
      localStorage.removeItem('asoland_account_cache_v1');
      renderDashboard();
      toast(authFailureMessage());
      return;
    }
    accountState={...accountState,...current,authenticated:true};
    if(accountState.claimed){toast(t('rewardClaimed'));renderDashboard();return;}
    const d=await api('/api/rewards/daily',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData,language:lang})});
    accountState={...accountState,...d,authenticated:true,claimed:!(!d.claimed)};
    localStorage.setItem('asoland_account_cache_v1',JSON.stringify(accountState));
    renderDashboard(); toast(`🎁 +${d.reward||0} 🪙`); try{telegramWebApp()?.HapticFeedback?.notificationOccurred?.('success')}catch(_){ }
  }catch(e){
    if(e.authState){accountState={...accountState,authenticated:false,authState:e.authState};localStorage.removeItem('asoland_account_cache_v1');renderDashboard();}
    toast(e.message||t('error'));
  }
}

function toggleFavorite(k){favorites=favorites.includes(k)?favorites.filter(x=>x!==k):[...favorites,k].slice(-12);saveLists();renderTools();try{telegramWebApp()?.HapticFeedback?.selectionChanged?.()}catch(e){}}
function recordUse(k){recent=[k,...recent.filter(x=>x!==k)].slice(0,8);saveLists();renderDashboard();}
function toolLabel(k){return t(k)}
function toolDesc(k){return desc[lang]?.[k]||''}
function renderTools(){
 const host=document.querySelector('#tools'); if(!host)return;
 host.innerHTML=`<div class="tools-toolbar">
   <div class="tools-title"><span class="section-kicker">${esc(t('quickActions'))}</span><strong>${esc(t('tools'))}</strong><small>${esc(t('toolsSubtitle'))}</small></div>
   <div class="tools-search"><span>⌕</span><input id="toolSearch" autocomplete="off" placeholder="${esc(t('searchTools'))}"></div>
 </div>
 <div class="category-pills" id="categoryPills">
   <button class="cat-pill active" data-cat="all">✨ ${esc(t('catAll'))}</button>
   <button class="cat-pill" data-cat="ai">🤖 ${esc(t('catAI'))}</button>
   <button class="cat-pill" data-cat="create">🎨 ${esc(t('catCreate'))}</button>
   <button class="cat-pill" data-cat="text">📝 ${esc(t('catText'))}</button>
   <button class="cat-pill" data-cat="info">📊 ${esc(t('catInfo'))}</button>
 </div>
 <div class="quick-row"><div><b>⚡ ${esc(t('quickActions'))}</b><small>${esc(t('quickSubtitle'))}</small></div>
   <div class="quick-actions">
    ${['aiChat','voice','sticker','download'].map(k=>`<button class="quick-btn" onclick="openTool('${k}')">${TOOL_META[k]?.emoji||({voice:'🎤',sticker:'🎨',download:'📥'}[k]||'✨')}<span>${esc(t(k))}</span></button>`).join('')}
   </div>
 </div>
 <div id="recentWrap" class="smart-section"></div>
 <div class="tools-grid" id="toolGrid"></div>`;
 const grid=host.querySelector('#toolGrid'), search=host.querySelector('#toolSearch');
 const cats=host.querySelectorAll('.cat-pill'); let activeCat='all';
 const paint=(q='')=>{
   const needle=q.trim().toLocaleLowerCase();
   const filtered=tools.filter(([e,k])=>{
     const meta=TOOL_META[k]||{cat:'create'};
     return (activeCat==='all'||meta.cat===activeCat) && `${toolLabel(k)} ${toolDesc(k)}`.toLocaleLowerCase().includes(needle);
   });
   grid.innerHTML=filtered.length?filtered.map(([e,k])=>{
     const fav=favorites.includes(k);
     return `<button class="tool ${fav?'is-fav':''}" onclick="openTool('${k}')"><span class="tool-glow"></span><span class="emoji">${TOOL_META[k]?.emoji||e}</span><b>${esc(toolLabel(k))}</b><small>${esc(toolDesc(k))}</small><span class="tool-star" onclick="event.stopPropagation();toggleFavorite('${k}')">${fav?'★':'☆'}</span></button>`;
   }).join(''):`<div class="empty-tools"><strong>⌕</strong><span>${esc(t('noResults'))}</span></div>`;
 };
 const paintRecent=()=>{
   const rw=host.querySelector('#recentWrap');
   const items=recent.filter(k=>tools.some(x=>x[1]===k)||['voice','sticker','download'].includes(k)).slice(0,4);
   if(!items.length){rw.innerHTML='';return}
   rw.innerHTML=`<div class="smart-head"><b>🕘 ${esc(t('recent'))}</b><button onclick="recent=[];saveLists();renderTools()">×</button></div><div class="recent-list">${items.map(k=>`<button onclick="openTool('${k}')">${TOOL_META[k]?.emoji||({voice:'🎤',sticker:'🎨',download:'📥'}[k]||'✨')} ${esc(t(k))}</button>`).join('')}</div>`;
 };
 paint();paintRecent(); search.addEventListener('input',e=>paint(e.target.value));
 cats.forEach(b=>b.addEventListener('click',()=>{cats.forEach(x=>x.classList.remove('active'));b.classList.add('active');activeCat=b.dataset.cat;paint(search.value)}));
}
function chatPanel(){panel('chatPanel');document.getElementById("chatPanel").innerHTML=`<div class="panel-head">🤖 <b>${t('aiChat')}</b></div><div class="messages" id="messages"><div class="msg bot">${t('aiHint')}</div></div><div class="composer"><textarea id="prompt" placeholder="${t('aiHint')}" rows="1"></textarea><button id="send">➤</button></div>`;document.querySelector('#send').onclick=sendAI;document.querySelector('#prompt').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI()}}}
async function sendAI(){const p=document.querySelector('#prompt'),v=p.value.trim();if(!v)return;const m=document.querySelector('#messages');m.insertAdjacentHTML('beforeend',`<div class="msg user">${esc(v)}</div>`);p.value='';m.insertAdjacentHTML('beforeend',`<div class="msg bot" id="aiLoad">${t('working')}</div>`);try{const d=await api('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:v,language:lang,initData:telegramWebApp()?.initData||''})});document.querySelector('#aiLoad')?.remove();m.insertAdjacentHTML('beforeend',`<div class="msg bot">${esc(d.reply)}</div>`);m.scrollTop=m.scrollHeight}catch(e){document.querySelector('#aiLoad').textContent=e.message}}
function openTool(k){recordUse(k);if(k==='aiChat'){chatPanel();return}if(k==='file'){filePanel();return}if(k==='teacher'){teacherPanel();return}if(k==='vision'){visionPanel();return}if(k==='prices'){pricesPanel();return}if(k==='weather'){weatherPanel();return}if(k==='text'){textToolsPanel();return}if(k==='more'){morePanel();return}if(k==='voice'){voicePanel();return}if(k==='sticker'){stickerPanel();return}if(k==='download'){downloadPanel();return}}
function simplePanel(title,html){
  panel('toolPanel');
  const el=document.getElementById('toolPanel');
  el.innerHTML=`<div class="panel-head"><span>${title}</span></div><div class="inner">${html}</div>`;
}

async function pricesPanel(){simplePanel('💰 '+t('prices'),`<div class="result">${t('working')}</div>`);try{const d=await api('/api/prices?language='+lang);document.getElementById("toolPanel").querySelector('.result').innerHTML=richText(d.text)}catch(e){document.getElementById("toolPanel").querySelector('.result').textContent=e.message}}
async function clientWeatherFallback(cityName){
  const cityText=(cityName||'').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim();
  if(cityText.length<2) throw new Error('نام شهر را وارد کن');
  const aliases={'تهران':'Tehran','مشهد':'Mashhad','اصفهان':'Isfahan','کرج':'Karaj','شیراز':'Shiraz','تبریز':'Tabriz','قم':'Qom','اهواز':'Ahvaz','کرمانشاه':'Kermanshah','ارومیه':'Urmia','رشت':'Rasht','زاهدان':'Zahedan','همدان':'Hamadan','کرمان':'Kerman','یزد':'Yazd','اردبیل':'Ardabil','بندرعباس':'Bandar Abbas','اراک':'Arak','قزوین':'Qazvin','زنجان':'Zanjan','سنندج':'Sanandaj','خرم آباد':'Khorramabad','خرم‌آباد':'Khorramabad','گرگان':'Gorgan','ساری':'Sari','بوشهر':'Bushehr','بجنورد':'Bojnord','ایلام':'Ilam','یاسوج':'Yasuj','شهرکرد':'Shahrekord','سمنان':'Semnan','بیرجند':'Birjand','هه‌ولێر':'Erbil','هەولێر':'Erbil','اربیل':'Erbil','سلێمانی':'Sulaymaniyah','سلیمانیه':'Sulaymaniyah','دهۆک':'Duhok','دهوک':'Duhok','کەرکووک':'Kirkuk','کرکوک':'Kirkuk','بغداد':'Baghdad','بەغدا':'Baghdad','نجف':'Najaf','کربلا':'Karbala','بصره':'Basra'};
  const q=aliases[cityText]||cityText;
  const geos=['https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:q,count:'5',language:'en',format:'json'}), 'https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:cityText,count:'5',language:'en',format:'json'})];
  let place=null,lastErr=null;
  for(const url of geos){
    try{const r=await fetch(url,{headers:{'Accept':'application/json'}});if(!r.ok)throw new Error('geocoding '+r.status);const d=await r.json();place=(d.results||[])[0];if(place)break;}catch(e){lastErr=e;}
  }
  if(!place) throw new Error(lang==='en'?'City not found.':'شهر پیدا نشد.');
  const params=new URLSearchParams({latitude:String(place.latitude),longitude:String(place.longitude),current:'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',forecast_days:'3',timezone:'auto',wind_speed_unit:'kmh'});
  const r=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{headers:{'Accept':'application/json'}});
  if(!r.ok) throw new Error('weather '+r.status);
  const d=await r.json(), c=d.current||{}, day=d.daily||{};
  const codeMap={0:['آسمان صاف','Clear sky'],1:['عمدتاً صاف','Mainly clear'],2:['نیمه‌ابری','Partly cloudy'],3:['ابری','Overcast'],45:['مه','Fog'],48:['مه یخ‌زن','Freezing fog'],51:['نم‌نم باران سبک','Light drizzle'],53:['نم‌نم باران','Drizzle'],55:['نم‌نم باران شدید','Heavy drizzle'],61:['باران سبک','Light rain'],63:['باران','Rain'],65:['باران شدید','Heavy rain'],71:['برف سبک','Light snow'],73:['برف','Snow'],75:['برف شدید','Heavy snow'],80:['رگبار سبک','Light showers'],81:['رگبار','Showers'],82:['رگبار شدید','Heavy showers'],95:['رعدوبرق','Thunderstorm'],96:['رعدوبرق با تگرگ','Thunderstorm with hail'],99:['رعدوبرق و تگرگ شدید','Heavy thunderstorm with hail']};
  const cond=(codeMap[c.weather_code]||['نامشخص','Unknown'])[lang==='en'?1:0];
  const title=lang==='en'?`Weather in ${place.name}`:`آب‌وهوای ${place.name}`;
  const labels=lang==='en'?['Temperature','Feels like','Condition','Humidity','Wind','Cloud cover','Current precipitation','Today rain probability','Today low/high']:['دما','احساس واقعی','وضعیت','رطوبت','باد','پوشش ابر','بارش فعلی','احتمال بارش امروز','کمینه/بیشینه امروز'];
  const mx=(day.temperature_2m_max||[])[0], mn=(day.temperature_2m_min||[])[0], rp=(day.precipitation_probability_max||[])[0];
  return `🌤 <b>${title}${place.country?`, ${place.country}`:''}</b>\n\n🌡 ${labels[0]}: <b>${c.temperature_2m ?? '—'}°C</b>\n🤗 ${labels[1]}: <b>${c.apparent_temperature ?? '—'}°C</b>\n☁️ ${labels[2]}: <b>${cond}</b>\n💧 ${labels[3]}: <b>${c.relative_humidity_2m ?? '—'}%</b>\n💨 ${labels[4]}: <b>${c.wind_speed_10m ?? '—'} km/h</b>\n☁️ ${labels[5]}: <b>${c.cloud_cover ?? '—'}%</b>\n🌧 ${labels[6]}: <b>${c.precipitation ?? '—'} mm</b>\n☔ ${labels[7]}: <b>${rp ?? '—'}%</b>\n📈 ${labels[8]}: <b>${mn ?? '—'}° / ${mx ?? '—'}°</b>\n\n📡 ${lang==='en'?'Source: Open-Meteo':'منبع: Open-Meteo'}`;
}
function weatherPanel(){simplePanel('🌤 '+t('weather'),`<input id="city" placeholder="${t('chooseCity')}"><button class="primary wide" id="weatherBtn">${t('search')}</button><div id="weatherResult" class="result"></div>`);weatherBtn.onclick=async()=>{const cityName=city.value.trim();if(!cityName){weatherResult.textContent=t('chooseCity');return;}weatherBtn.disabled=true;weatherResult.textContent=t('working');try{const d=await api('/api/weather',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:cityName,language:lang})});weatherResult.innerHTML=richText(d.text)}catch(e){try{const text=await clientWeatherFallback(cityName);weatherResult.innerHTML=richText(text)}catch(f){weatherResult.textContent=String(f.message||e.message||t('error'))}}finally{weatherBtn.disabled=false}}}
function filePanel(){panel('filePanel');document.getElementById("filePanel").innerHTML=`<div class="panel-head">📚 <b>${t('file')}</b></div><div class="inner"><label class="upload"><input id="fileInput" type="file" accept=".pdf,.docx,.txt"><span>📎 ${t('upload')}</span></label><small>${t('uploadHint')}</small><div id="fileResult" class="result"></div></div>`;fileInput.onchange=uploadFile}
async function uploadFile(){const f=fileInput.files[0];if(!f)return;fileResult.textContent=t('working');const fd=new FormData();fd.append('file',f);try{currentFile=await api('/api/files/upload',{method:'POST',body:fd});fileResult.innerHTML=`<b>📄 ${esc(currentFile.name)}</b><div class="actions">${[['summary','summary'],['notes','notes'],['question','question'],['quiz','quiz'],['flashcards','flashcards'],['translate','translate']].map(a=>`<button onclick="fileAction('${a[0]}')">${t(a[1])}</button>`).join('')}</div><div id="fileOut" class="result">${t('fileReady')}</div>`}catch(e){fileResult.textContent=e.message}}
async function fileAction(a){let input='';if(a==='question')input=prompt(t('ask'))||'';if(a==='translate')input=prompt(t('target'))||'English';fileOut.textContent=t('working');try{const d=await api('/api/files/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({file_id:currentFile.id,action:a,user_input:input,language:lang})});fileOut.textContent=d.result}catch(e){fileOut.textContent=e.message}}
function teacherPanel(){simplePanel('👨‍🏫 '+t('teacher'),`<select id="level"><option value="beginner">${t('beginner')}</option><option value="intermediate">${t('intermediate')}</option><option value="advanced">${t('advanced')}</option></select><select id="teacherMode"><option value="conversation">${t('conversation')}</option><option value="correct">${t('correct')}</option><option value="vocabulary">${t('vocabulary')}</option><option value="grammar">${t('grammar')}</option></select><textarea id="teacherInput" placeholder="${t('teacherPlaceholder')}"></textarea><button class="primary wide" onclick="sendTeacher()">${t('send')}</button><div id="teacherResult" class="result"></div>`)}
async function sendTeacher(){teacherResult.textContent=t('working');try{const d=await api('/api/teacher',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:teacherInput.value,level:level.value,mode:teacherMode.value,language:lang})});teacherResult.textContent=d.reply}catch(e){teacherResult.textContent=e.message}}
function visionPanel(){simplePanel('🖼️ '+t('vision'),`<p class="muted">${t('visionHint')}</p><label class="upload"><input id="visionInput" type="file" accept="image/*"><span>🖼️ ${t('chooseImage')}</span></label><div class="row"><button class="primary" onclick="solveVision()">🧠 ${t('solve')}</button><button class="primary" onclick="ocrVision()">🔤 OCR</button></div><div id="visionResult" class="result"></div>`);visionInput.onchange=()=>{if(visionInput.files[0])visionResult.textContent=visionInput.files[0].name}}
function textToolsPanel(){simplePanel('📝 '+t('text'),`<div class="more-grid"><button onclick="voicePanel()">🎤 ${t('voice')}</button><button onclick="translatePanel()">🌐 ${t('translateText')}</button><button onclick="summarizePanel()">📝 ${t('summarize')}</button><button onclick="fancyPanel()">✍ ${t('fancy')}</button><button onclick="qrPanel()">📱 ${t('qr')}</button><button onclick="shortPanel()">🔗 ${t('short')}</button><button onclick="compressImagePanel()">🗜️ ${t('compressImage')}</button><button onclick="compressVideoPanel()">🗜️ ${t('compressVideo')}</button><button onclick="pdfPanel()">📄 ${t('photoPdf')}</button><button onclick="wordPanel()">📝 ${t('textWord')}</button><button onclick="clockPanel()">🕔 ${t('clock')}</button></div>`)}
function voicePanel(){simplePanel('🎤 '+t('voice'),`<select id="voiceLang"><option value="auto">${t('auto')}</option><option value="fa">${t('fa')}</option><option value="ckb">${t('ckb')}</option><option value="en">${t('en')}</option></select><p class="muted">${t('recordHint')}</p><div class="row"><button class="primary" id="recordBtn">🎙 ${t('record')}</button><input id="voiceFile" type="file" accept="audio/*"></div><div id="voiceResult" class="result"></div>`);recordBtn.onclick=toggleRecord;voiceFile.onchange=transcribeFile}
async function toggleRecord(){if(recorder&&recorder.state==='recording'){recorder.stop();recordBtn.classList.remove('recording');recordBtn.textContent='🎙 '+t('record');return}if(!navigator.mediaDevices?.getUserMedia){toast(t('browserNoRecord'));return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>recordChunks.push(e.data);recorder.onstop=()=>{stream.getTracks().forEach(x=>x.stop());const blob=new Blob(recordChunks,{type:recorder.mimeType||'audio/webm'});sendVoice(blob,'voice.webm')};recorder.start();recordBtn.classList.add('recording');recordBtn.textContent='⏹ '+t('stop')}catch(e){voiceResult.textContent=e.message}}
async function transcribeFile(){const f=voiceFile.files[0];if(f)sendVoice(f,f.name)}
async function sendVoice(blob,name){voiceResult.textContent=t('working');const fd=new FormData();fd.append('file',blob,name);try{const d=await api('/api/voice-to-text?language='+voiceLang.value,{method:'POST',body:fd});voiceResult.textContent=d.text}catch(e){voiceResult.textContent=e.message}}
function translatePanel(){simplePanel('🌐 '+t('translateText'),`<textarea id="transIn"></textarea><select id="transLang"><option value="fa">${t('fa')}</option><option value="ckb">${t('ckb')}</option><option value="en">${t('en')}</option></select><button class="primary wide" onclick="doTranslate()">${t('send')}</button><div id="transOut" class="result"></div>`)}
async function doTranslate(){transOut.textContent=t('working');try{const d=await api('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:transIn.value,target_language:transLang.value})});transOut.textContent=d.text}catch(e){transOut.textContent=e.message}}
function summarizePanel(){simplePanel('📝 '+t('summarize'),`<textarea id="sumIn"></textarea><button class="primary wide" onclick="doSummarize()">${t('send')}</button><div id="sumOut" class="result"></div>`)}async function doSummarize(){sumOut.textContent=t('working');try{const d=await api('/api/summarize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:sumIn.value,language:lang})});sumOut.textContent=d.text}catch(e){sumOut.textContent=e.message}}
function fancyPanel(){simplePanel('✍ '+t('fancy'),`<textarea id="fancyIn"></textarea><button class="primary wide" onclick="doFancy()">${t('create')}</button><div id="fancyOut" class="result"></div>`)}async function doFancy(){fancyOut.textContent=t('working');try{const d=await api('/api/fancy-text',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:fancyIn.value})});fancyOut.innerHTML=Object.entries(d.items).map(([k,v])=>`<b>${esc(k)}</b>\n${esc(v)}\n`).join('\n')}catch(e){fancyOut.textContent=e.message}}
function qrPanel(){simplePanel('📱 '+t('qr'),`<input id="qrIn" placeholder="${t('qrPlaceholder')}"><button class="primary wide" onclick="doQR()">${t('create')}</button><div id="qrOut" class="result"></div>`)}async function doQR(){qrOut.textContent=t('working');try{const d=await api('/api/qr',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:qrIn.value})});qrOut.innerHTML=`<img src="${d.url}" style="max-width:100%;border-radius:12px"><br><a class="download" href="${d.url}" download>دانلود QR</a>`}catch(e){qrOut.textContent=e.message}}
function shortPanel(){simplePanel('🔗 '+t('short'),`<input id="shortIn" placeholder="${t('urlPlaceholder')}"><button class="primary wide" onclick="doShort()">${t('create')}</button><div id="shortOut" class="result"></div>`)}async function doShort(){shortOut.textContent=t('working');try{const d=await api('/api/short-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:shortIn.value})});shortOut.innerHTML=`<a href="${esc(d.url)}" target="_blank">${esc(d.url)}</a>`}catch(e){shortOut.textContent=e.message}}
function morePanel(){simplePanel('⚙️ '+t('more'),`<div class="more-grid"><button onclick="downloadPanel()">📥 ${t('download')}</button><button onclick="musicPanel()">🎵 ${t('music')}</button><button onclick="lyricsPanel()">📜 ${t('lyrics')}</button><button onclick="stickerPanel()">🖼️ ${t('sticker')}</button><button onclick="subtitlePanel()">🎬 ${t('subtitle')}</button><button onclick="calcPanel()">🧮 ${t('calculator')}</button><button onclick="currencyPanel()">💱 ${t('currency')}</button><button onclick="fortunePanel()">🔮 ${t('fortune')}</button><button onclick="newsPanel()">📰 ${t('news')}</button><button onclick="studentPanel()">🎓 ${t('student')}</button><button onclick="calendarPanel()">📅 ${t('calendar')}</button><button onclick="configPanel()">🩷 ${t('config')}</button><button onclick="alertsPanel()">🔔 ${t('alerts')}</button><button onclick="chartPanel()">📊 ${t('chart')}</button><button onclick="reminderPanel()">⏰ ${t('reminder')}</button></div>`)}
function downloadPanel(){simplePanel('📥 '+t('download'),`<input id="downloadUrl" placeholder="${t('source')}"><select id="quality"><option value="360">360p</option><option value="720" selected>720p</option><option value="1080">1080p</option><option value="audio">MP3</option></select><button class="primary wide" id="downloadBtn" onclick="doDownload()">${t('download')}</button><div id="downloadOut" class="result"></div>`)}async function doDownload(){const btn=document.getElementById('downloadBtn');if(btn.disabled)return;btn.disabled=true;const label=btn.textContent;btn.textContent=t('working');downloadOut.textContent=t('working');try{const d=await api('/api/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:downloadUrl.value,quality:quality.value,user_id:telegramWebApp()?.initData||'',initData:telegramWebApp()?.initData||''})});downloadOut.innerHTML=`<b>${esc(d.title||'')}</b><br>${d.sent?'✅ به ربات ارسال شد':'⚠️ آماده دانلود است'}<br><a class="download" href="${d.url}" download>${d.audio?t('downloadMp3'):t('video')}</a>`}catch(e){const msg=String(e.message||e);downloadOut.innerHTML=e.status===429||/429|Too Many Requests|Render/.test(msg)?`<div class="error">⚠️ ${esc(msg)}</div>`:`<div class="error">❌ ${esc(msg)}</div>`}finally{btn.disabled=false;btn.textContent=label}}
function musicPanel(){simplePanel('🎵 '+t('music'),`<input id="musicQ"><button class="primary wide" onclick="searchMusic()">${t('search')}</button><div id="musicOut" class="result"></div>`)}async function searchMusic(){musicOut.textContent=t('working');try{const d=await api('/api/music/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:musicQ.value})});musicOut.innerHTML=d.results.map((x,i)=>`<div style="margin:8px 0"><b>${i+1}. ${esc(x.title)}</b><br><a class="download" href="${esc(x.url)}" target="_blank">YouTube</a></div>`).join('')||t('error')}catch(e){musicOut.textContent=e.message}}
function lyricsPanel(){simplePanel('📜 '+t('lyrics'),`<input id="artist" placeholder="${t('artist')}"><input id="songTitle" placeholder="${t('songTitle')}"><button class="primary wide" onclick="doLyrics()">${t('search')}</button><div id="lyricsOut" class="result"></div>`)}async function doLyrics(){lyricsOut.textContent=t('working');try{const d=await api('/api/music/lyrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({artist:artist.value,title:songTitle.value})});lyricsOut.textContent=d.text}catch(e){lyricsOut.textContent=e.message}}
function stickerPanel(){simplePanel('🖼️ '+t('sticker'),`<div class="sticker-composer"><textarea id="stickerTextInput" autocomplete="off" spellcheck="false" placeholder="${t('stickerText')}"></textarea><select id="stickerMode"><option value="text">${t('stickerText')}</option><option value="image">${t('stickerPhoto')}</option></select><label class="upload" id="stickerPhotoWrap" style="display:none"><input id="stickerPhotoFile" type="file" accept="image/*"><span>🖼️ ${t('chooseImage')}</span></label><div class="row"><input id="stickerBg" value="#4080b4" placeholder="${t('stickerBg')}"><input id="stickerFg" value="#ffffff" placeholder="${t('stickerFg')}"></div><button type="button" class="primary wide" id="stickerCreateBtn">${t('create')}</button><div id="stickerOut" class="result"></div></div>`);
const modeEl=document.getElementById('stickerMode'), wrapEl=document.getElementById('stickerPhotoWrap'), createEl=document.getElementById('stickerCreateBtn');
modeEl.addEventListener('change',()=>{wrapEl.style.display=modeEl.value==='image'?'block':'none';});
createEl.addEventListener('click',doSticker);
}
async function doSticker(){
 const input=document.getElementById('stickerTextInput'); const modeEl=document.getElementById('stickerMode'); const outEl=document.getElementById('stickerOut');
 const text=String(input?.value ?? '').replace(/\u200b/g,'').trim(); const mode=modeEl?.value || 'text'; const file=document.getElementById('stickerPhotoFile')?.files?.[0] || null;
 if(!text){outEl.textContent=t('stickerText'); input?.focus(); return;}
 if(mode==='image'&&!file){outEl.textContent=t('chooseImage'); return;}
 outEl.textContent=t('working');
 const fd=new FormData(); fd.append('text',text); fd.append('mode',mode); fd.append('bg',document.getElementById('stickerBg')?.value || '#4080b4'); fd.append('fg',document.getElementById('stickerFg')?.value || '#ffffff'); fd.append('initData', telegramWebApp()?.initData || '');
 if(file) fd.append('file',file,file.name);
 try{const d=await api('/api/sticker',{method:'POST',body:fd});
   outEl.innerHTML=`<div class="sticker-preview-wrap"><img class="sticker-preview" src="${d.url}" alt="sticker"><div class="sticker-success">${d.sent?'✅ '+esc(t('stickerSent')):'✅ '+esc(t('stickerReady'))}</div><a class="download" href="${d.url}" download>${t('downloadSticker')}</a></div>`;
   try{telegramWebApp()?.HapticFeedback?.notificationOccurred?.('success')}catch(_){ }
 }catch(e){outEl.textContent=e.message}
}
function subtitlePanel(){simplePanel('🎬 '+t('subtitle'),`<select id="subLang"><option value="ckb">${t('ckb')}</option><option value="fa">${t('fa')}</option><option value="en">${t('en')}</option></select><label class="upload"><input id="subFile" type="file" accept="video/*"><span>🎬 ${t('chooseImage')}</span></label><button class="primary wide" onclick="doSubtitle()">${t('create')}</button><div id="subOut" class="result"></div>`)}async function doSubtitle(){if(!subFile.files[0]){subOut.textContent=t('noMedia');return}subOut.textContent=t('working');const fd=new FormData();fd.append('file',subFile.files[0]);try{const d=await api('/api/subtitle?target_language='+subLang.value,{method:'POST',body:fd});subOut.innerHTML=`${d.video_url?`<a class="download" href="${d.video_url}" download>${t('video')}</a>`:''}<br><a class="download" href="${d.srt_url}" download>${t('srt')}</a>`}catch(e){subOut.textContent=e.message}}
function calcPanel(){simplePanel('🧮 '+t('calculator'),`<input id="calcIn" placeholder="${t('calcPlaceholder')}"><button class="primary wide" onclick="doCalc()">${t('calculate')}</button><div id="calcOut" class="result"></div>`)}async function doCalc(){calcOut.textContent=t('working');try{const d=await api('/api/calculator',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:calcIn.value,language:lang})});calcOut.textContent=d.text}catch(e){calcOut.textContent=e.message}}
function currencyPanel(){simplePanel('💱 '+t('currency'),`<input id="curIn" placeholder="${t('currencyPlaceholder')}"><button class="primary wide" onclick="doCurrency()">${t('convert')}</button><div id="curOut" class="result"></div>`)}async function doCurrency(){curOut.textContent=t('working');try{const d=await api('/api/currency',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:curIn.value,language:lang})});curOut.textContent=d.text}catch(e){curOut.textContent=e.message}}
async function fortunePanel(){simplePanel('🔮 '+t('fortune'),`<div class="result">${t('working')}</div>`);try{const d=await api('/api/fortune?name='+encodeURIComponent(t('fortuneFriend'))+'&language='+lang);document.getElementById("toolPanel").querySelector('.result').innerHTML=richText(d.text)}catch(e){document.getElementById("toolPanel").querySelector('.result').textContent=e.message}}
function calendarPanel(){simpleEndpoint('/api/calendar?language='+lang,'📅 '+t('calendar'))}function simpleEndpoint(url,title){simplePanel(title,`<div class="result">${t('working')}</div>`);api(url).then(d=>document.getElementById("toolPanel").querySelector('.result').innerHTML=richText(d.text)||'').catch(e=>document.getElementById("toolPanel").querySelector('.result').textContent=e.message)}
function newsPanel(){simplePanel('📰 '+t('news'),`<div class="more-grid">${['general','tech','economy','crypto','student'].map(c=>`<button onclick="getNews('${c}')">${t(c==='student'?'education':c)}</button>`).join('')}</div><div id="newsOut" class="result"></div>`)}async function getNews(c){newsOut.textContent=t('working');try{const d=await api('/api/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category:c,language:lang})});newsOut.textContent=d.text}catch(e){newsOut.textContent=e.message}}
function studentPanel(){simplePanel('🎓 '+t('student'),`<textarea id="studentIn" placeholder="${t('studentPlaceholder')}"></textarea><button class="primary wide" onclick="doStudent()">${t('solve')}</button><div id="studentOut" class="result"></div>`)}async function doStudent(){studentOut.textContent=t('working');try{const d=await api('/api/student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:studentIn.value,language:lang})});studentOut.textContent=d.text}catch(e){studentOut.textContent=e.message}}
function configPanel(){simplePanel('🩷 '+t('config'),`<select id="proto"><option>vless</option><option>vmess</option><option>trojan</option><option>ss</option></select><button class="primary wide" onclick="getConfigs()">${t('search')}</button><div id="configOut" class="result"></div>`)}async function getConfigs(){configOut.textContent=t('working');try{const d=await api('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({protocol:proto.value})});configOut.textContent=d.configs.join('\n\n')}catch(e){configOut.textContent=e.message}}
function alertsPanel(){simplePanel('🔔 '+t('alerts'),`<div class="row"><input id="alertSymbol" placeholder="${t('alertSymbolPlaceholder')}"><input id="alertTarget" type="number" placeholder="${t('target')}"></div><select id="alertDir"><option value="above">${t('above')}</option><option value="below">${t('below')}</option></select><button class="primary wide" onclick="createAlert()">${t('create')}</button><div id="alertOut" class="result"></div>`);loadAlerts()}async function loadAlerts(){try{const d=await api('/api/alerts?user_id='+encodeURIComponent(telegramWebApp()?.initData||''));alertOut.textContent=d.alerts.map((x,i)=>`${i+1}. ${x.symbol} ${x.direction} ${x.target}`).join('\n')||'—'}catch{}}async function createAlert(){try{await api('/api/alerts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({symbol:alertSymbol.value,target:Number(alertTarget.value),direction:alertDir.value,user_id:telegramWebApp()?.initData||''})});loadAlerts()}catch(e){alertOut.textContent=e.message}}
function reminderPanel(){simplePanel('⏰ '+t('reminder'),`<input id="remText" placeholder="${t('reminder')}"><input id="remDue" type="datetime-local"><button class="primary wide" onclick="createReminder()">${t('create')}</button><div id="remOut" class="result"></div>`);loadReminders()}async function loadReminders(){try{const d=await api('/api/reminders?user_id='+encodeURIComponent(telegramWebApp()?.initData||''));remOut.textContent=d.reminders.map((x,i)=>`${i+1}. ${x.text} ${x.due}`).join('\n')||'—'}catch{}}async function createReminder(){try{await api('/api/reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:remText.value,due:remDue.value,user_id:telegramWebApp()?.initData||''})});loadReminders()}catch(e){remOut.textContent=e.message}}
async function profilePanel(){
  panel('profilePanel');
  const u=currentUser();
  const avatar=u?.photo_url?`<img class="profile-avatar" src="${esc(u.photo_url)}" alt="">`:`<div class="profile-avatar placeholder">${esc((u?.first_name||'A').slice(0,1))}</div>`;
  document.getElementById('profilePanel').innerHTML=`<div class="panel-head">◉ <b>${t('profileText')}</b></div>
  <div class="profile-card profile-card-pro">${avatar}<div class="profile-main"><strong>${esc(u?.first_name||t('userName'))}</strong><div class="muted">${u?.username?'@'+esc(u.username):t('profileText')}</div><span class="profile-badge">✦ AsoLand</span></div></div>
  <div class="profile-stats"><div><b>${favorites.length}</b><small>${t('favorite')}</small></div><div><b>${recent.length}</b><small>${t('recent')}</small></div><div><b>${localStorage.getItem('asoland_visit_count')||'1'}</b><small>${t('visits')}</small></div></div>
  <div class="profile-stats account-stats"><div><b id="accountCoins">…</b><small>🪙 AsoCoin</small></div><div><b id="accountXp">…</b><small>⭐ XP</small></div><div><b id="accountLevel">…</b><small>${t('level')}</small></div></div>
  <div class="inner result" id="profileResult">${t('working')}</div>`;
  const d=await syncAccount();
  const result=document.getElementById('profileResult');
  if(d.authenticated){
    const c=document.getElementById('accountCoins'),x=document.getElementById('accountXp'),l=document.getElementById('accountLevel');
    if(c)c.textContent=String(d.coins||0); if(x)x.textContent=String(d.xp||0); if(l)l.textContent=String(d.level||1);
    if(result)result.innerHTML=`${t('auth')}<br>${t('user')}: ${esc(d.firstName||u?.first_name||'')}<br>${d.username?'@'+esc(d.username):''}<br>🔥 ${d.streak||0} ${t('recent')}`;
  }else if(result) result.textContent=authFailureMessage();
}

document.getElementById('lang').onclick=()=>{
 let m=document.getElementById('languageMenu');
 if(m){m.remove();return}
 m=document.createElement('div');m.id='languageMenu';m.className='language-menu';
 m.innerHTML=`<div class="language-title">🌐 ${esc(t('language'))}</div><button data-l="fa">🇮🇷 <span>${esc(t('fa'))}</span></button><button data-l="ckb">☀️ <span>${esc(t('ckb'))}</span></button><button data-l="en">🇬🇧 <span>${esc(t('en'))}</span></button>`;
 document.body.appendChild(m);
 requestAnimationFrame(()=>m.classList.add('show'));
 m.querySelectorAll('button').forEach(b=>b.onclick=()=>{lang=b.dataset.l;localStorage.setItem('asoland_lang',lang);m.classList.remove('show');setTimeout(()=>m.remove(),180);applyLang();try{telegramWebApp()?.HapticFeedback?.selectionChanged?.()}catch(e){}});
 setTimeout(()=>{const close=e=>{if(!m.contains(e.target)&&e.target.id!=='lang'){m.classList.remove('show');setTimeout(()=>m.remove(),180);document.removeEventListener('pointerdown',close)}};document.addEventListener('pointerdown',close)},0);
};
function applyTheme(){document.documentElement.dataset.theme=theme;document.body.classList.toggle('light-mode',theme==='light');const b=document.getElementById('themeToggle');if(b){b.textContent=theme==='light'?'🌙':'☀️';b.setAttribute('aria-label',theme==='light'?t('darkMode'):t('lightMode'));b.title=theme==='light'?t('darkMode'):t('lightMode')}try{tg?.setHeaderColor?.(theme==='light'?'#f3f7f3':'#080b0e');tg?.setBackgroundColor?.(theme==='light'?'#f3f7f3':'#080b0e')}catch(e){}}
document.getElementById('heroAi')?.addEventListener('click',()=>chatPanel());
const themeBtn=document.getElementById('themeToggle');if(themeBtn)themeBtn.onclick=()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('asoland_theme',theme);applyTheme();try{telegramWebApp()?.HapticFeedback?.impactOccurred?.('light')}catch(e){}};
window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change',e=>{if(!localStorage.getItem('asoland_theme')){theme=e.matches?'light':'dark';applyTheme()}});
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.tab==='home')home();if(b.dataset.tab==='ai')chatPanel();if(b.dataset.tab==='tools')morePanel();if(b.dataset.tab==='profile')profilePanel();setTimeout(()=>{const target=document.querySelector('.panel[style*="display: block"]')||document.querySelector('.panel:not([style])');if(target&&getComputedStyle(target).display!=='none')target.scrollIntoView({behavior:'smooth',block:'start'})},80)});telegramWebApp()?.BackButton?.onClick(home);try{tg?.ready();tg?.expand();}catch(e){} refreshMiniUser(); renderDashboard(); syncAccount(); applyLang(); applyTheme(); home();

function compressImagePanel(){simplePanel('🗜️ '+t('compressImageTitle'),`<label class="upload"><input id="ciFile" type="file" accept="image/*"><span>🖼️ ${t('chooseImage')}</span></label><button class="primary wide" onclick="doCompressImage()">${t('create')}</button><div id="ciOut" class="result"></div>`)}
async function doCompressImage(){if(!ciFile.files[0])return;ciOut.textContent=t('working');const fd=new FormData();fd.append('file',ciFile.files[0]);try{const d=await api('/api/compress-image',{method:'POST',body:fd});ciOut.innerHTML=`<a class="download" href="${d.url}" download>${t('downloadImage')}</a>`}catch(e){ciOut.textContent=e.message}}
function compressVideoPanel(){simplePanel('🗜️ '+t('compressVideoTitle'),`<label class="upload"><input id="cvFile" type="file" accept="video/*"><span>🎬 ${t('chooseImage')}</span></label><button class="primary wide" onclick="doCompressVideo()">${t('create')}</button><div id="cvOut" class="result"></div>`)}
async function doCompressVideo(){if(!cvFile.files[0])return;cvOut.textContent=t('working');const fd=new FormData();fd.append('file',cvFile.files[0]);try{const d=await api('/api/compress-video',{method:'POST',body:fd});cvOut.innerHTML=`<a class="download" href="${d.url}" download>${t('downloadVideo')}</a>`}catch(e){cvOut.textContent=e.message}}
function pdfPanel(){simplePanel('📄 '+t('photoPdfTitle'),`<label class="upload"><input id="pdfFiles" type="file" accept="image/*" multiple><span>🖼️ ${t('chooseImage')}</span></label><button class="primary wide" onclick="doPDF()">${t('create')}</button><div id="pdfOut" class="result"></div>`)}
async function doPDF(){if(!pdfFiles.files.length)return;pdfOut.textContent=t('working');const fd=new FormData();[...pdfFiles.files].forEach(f=>fd.append('files',f));try{const d=await api('/api/photo-to-pdf',{method:'POST',body:fd});pdfOut.innerHTML=`<a class="download" href="${d.url}" download>${t('downloadPdf')}</a>`}catch(e){pdfOut.textContent=e.message}}
function wordPanel(){simplePanel('📝 '+t('textWordTitle'),`<textarea id="wordIn"></textarea><button class="primary wide" onclick="doWord()">${t('create')}</button><div id="wordOut" class="result"></div>`)}async function doWord(){wordOut.textContent=t('working');try{const d=await api('/api/text-to-word',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:wordIn.value,language:lang})});wordOut.innerHTML=`<a class="download" href="${d.url}" download>${t('downloadWord')}</a>`}catch(e){wordOut.textContent=e.message}}
function clockPanel(){simpleEndpoint('/api/clock?language='+lang,'🕔 '+t('calendar'))}
function chartPanel(){simplePanel('📊 '+t('chart'),`<select id="chartCoin"><option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option><option value="solana">Solana</option></select><button class="primary wide" onclick="doChart()">${t('create')}</button><div id="chartOut" class="result"></div>`)}async function doChart(){chartOut.textContent=t('working');try{const d=await api('/api/chart?coin='+encodeURIComponent(chartCoin.value)+'&days=7');chartOut.innerHTML=`<img src="${d.url}" style="width:100%;border-radius:12px"><br><a class="download" href="${d.url}" download>دانلود نمودار</a>`}catch(e){chartOut.textContent=e.message}}

async function solveVision(){if(!visionInput.files[0])return;visionResult.textContent=t('working');const fd=new FormData();fd.append('file',visionInput.files[0]);try{const d=await api('/api/vision/solve?language='+lang,{method:'POST',body:fd});visionResult.textContent=d.result}catch(e){visionResult.textContent=e.message}}
async function ocrVision(){if(!visionInput.files[0])return;visionResult.textContent=t('working');const fd=new FormData();fd.append('file',visionInput.files[0]);try{const d=await api('/api/vision',{method:'POST',body:fd});visionResult.textContent=d.result}catch(e){visionResult.textContent=e.message}}

window.addEventListener('load',()=>{const splash=document.getElementById('splash');setTimeout(()=>splash?.classList.add('hide'),480);setTimeout(()=>splash?.remove(),1000)});
