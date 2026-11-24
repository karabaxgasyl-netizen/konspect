import json, re
M=json.load(open('meta.json')); pages={int(k):v for k,v in json.load(open('pages.json')).items()}
heads=M['heads']
T=[(1,'Понятие хозяйства. Его структура',10),(2,'Этапы развития хозяйства',13),(3,'Сельское хозяйство. Растениеводство',19),(4,'Животноводство. Зональная специализация сельского хозяйства',26),(5,'Агропромышленный комплекс. Лёгкая и пищевая промышленность',31),(6,'Лесной комплекс',35),(7,'Топливно-энергетический комплекс. Топливная промышленность',40),(8,'Электроэнергетика',51),(9,'Металлургический комплекс',55),(10,'Машиностроительный комплекс',61),(11,'Химическая промышленность',67),(12,'Транспорт',73),(13,'Информационная инфраструктура',78),(14,'Сфера обслуживания. Рекреационное хозяйство',82),(15,'Территориальное (географическое) разделение труда',85),(16,'Восточно-Европейская равнина',92),(17,'Волга',98),(18,'Центральная Россия: состав, географическое положение',103),(19,'Центральный район: особенности населения',109),(20,'Хозяйство Центрального района',113),(21,'Москва — столица России',117),(22,'Города Центрального района',121),(23,'Центрально-Чернозёмный район',127),(24,'Волго-Вятский район',133),(25,'Географическое положение и природа',140),(26,'Города на старых водных торговых путях',143),(27,'Санкт-Петербург — новый «хозяйственный узел» России',146),(28,'Санкт-Петербург — «вторая столица» России',149),(29,'Калининградская область',152),(30,'Географическое положение и природа',158),(31,'Этапы развития хозяйства',161),(32,'Роль Европейского Севера в развитии русской культуры',165),(33,'Географическое положение и природа',172),(34,'Население и хозяйство',176),(35,'Крым',186),(36,'Природные условия Северного Кавказа',195),(37,'Хозяйство Северного Кавказа',198),(38,'Народы Северного Кавказа',201),(39,'Южные моря России',205),(40,'Географическое положение и природа',211),(41,'Этапы развития и современное хозяйство',217),(42,'Население и города Урала. Проблемы района',222),(43,'Природа Сибири',229),(44,'Природа и ресурсы гор юга Сибири',235),(45,'Арктические моря',239),(46,'Население Сибири',243),(47,'Хозяйственное освоение Сибири',249),(48,'Природные условия и ресурсы',257),(49,'Хозяйство района',260),(50,'Природные условия и ресурсы',267),(51,'Байкал',271),(52,'Хозяйство района',277),(53,'Формирование территории',283),(54,'Природные условия и ресурсы',290),(55,'Моря Тихого океана',296),(56,'Население района',299),(57,'Хозяйство района',303)]
STAR={22,26}
def chap(n):
    if n<=2: return 'Тема 1. Общая характеристика хозяйства'
    if n<=15: return 'Тема 2. Главные отрасли и межотраслевые комплексы'
    if n<=17: return 'Тема 3. Европейская часть России'
    for a,b,r in [(18,24,'Центральная Россия'),(25,29,'Северо-Западный район'),(30,32,'Европейский Север'),(33,34,'Поволжье'),(35,39,'Европейский Юг'),(40,42,'Урал')]:
        if a<=n<=b: return 'Тема 3 · '+r
    if n<=47: return 'Тема 4. Азиатская часть России'
    for a,b,r in [(48,49,'Западная Сибирь'),(50,52,'Восточная Сибирь'),(53,57,'Дальний Восток')]:
        if a<=n<=b: return 'Тема 4 · '+r
def raw_range(n,start,end_page,nextn):
    txt=''
    for p in range(start+1,end_page+2):
        t=pages.get(p,'')
        t='\n'.join(l for l in t.split('\n') if not re.fullmatch(r'\s*\d{1,3}\s*',l))
        txt+=t+'\n'
    m=re.search(r'§\s*%d\*?\.'%n,txt)
    if m: txt=txt[m.end():]
    if nextn:
        m=re.search(r'\n§\s*%d\*?\.'%nextn,txt)
        if m: txt=txt[:m.start()]
    return txt
def clean_join(t):
    t=t.replace('\u00ad','').replace('\x0c','\n')
    t=re.sub(r'(\w)-\n(\w)',lambda m:m.group(1)+m.group(2) if m.group(2).islower() else m.group(1)+'-'+m.group(2),t)
    return t
BAD=re.compile(r'[а-яё][А-ЯЁ][а-яё]')
def sentences(text):
    text=re.sub(r'\s+',' ',text).strip()
    parts=re.split(r'(?<=[\.\!\?»])\s+(?=[А-ЯЁ«(0-9])',text)
    out=[];buf=''
    for s in parts:
        buf=(buf+' '+s).strip() if buf else s
        if re.search(r'(\b[А-ЯЁ]\.|т\. ?е\.|т\.|г\.|гг\.|в\.|вв\.|др\.|км\.|млн\.|млрд\.|тыс\.|рис\.|табл\.|см\.|ок\.)$',buf) and len(buf)<600: continue
        out.append(buf);buf=''
    if buf: out.append(buf)
    return out
def ok(s):
    if len(s)<25: return False
    if BAD.search(s): return False
    if re.match(r'^(Рис\.|Таблица|Табл\.|Источник)',s): return False
    if s.count('?')>0 and len(s)<200 and not s.endswith('.'): return False
    return True
res=[]
for idx,(n,title,pg) in enumerate(T):
    endpg=T[idx+1][2] if idx+1<len(T) else 312
    nextn=T[idx+1][0] if idx+1<len(T) else None
    raw=clean_join(raw_range(n,pg,endpg,nextn))
    # page heads
    hs=[]
    for p in range(pg+1,endpg+2): hs+=heads.get(str(p),[])
    # merge multi-line heads
    merged=[];buf=''
    for h in hs:
        buf=(buf+' '+h).strip()
        if buf.endswith('?') or buf in('Выводы','Ключевые слова и выражения','Вопросы и задания') or len(buf)>140:
            merged.append(buf);buf=''
    qheads=[h for h in merged if h.endswith('?')]
    # split blocks
    main=raw;concl='';kw='';qs=''
    m=re.search(r'\nВыводы\s*\n',main)
    rest=''
    if m: rest=main[m.end():]; main=main[:m.start()]
    m2=re.search(r'Ключевые слова и выражения',rest)
    if m2: concl=rest[:m2.start()]; rest=rest[m2.end():]
    m3=re.search(r'Вопросы и задания',rest or main)
    if rest:
        if m3: kw=rest[:m3.start()]; qs=rest[m3.end():]
        else: kw=rest
    else:
        m3=re.search(r'\nВопросы и задания',main)
        if m3: qs=main[m3.end():]; main=main[:m3.start()]
    kws=[re.sub(r'\s+',' ',k).strip(' ꔷ•') for k in re.split(r'ꔷ|\n(?=[А-ЯЁ])',kw)]
    kws=[k for k in kws if 2<len(k)<70]
    # questions
    qlist=[re.sub(r'\s+',' ',q).strip() for q in re.split(r'\n\s*(?=\d+\.\s)',re.sub(r'[▶]+','',qs))]
    qlist=[re.sub(r'^\d+\.\s*','',q) for q in qlist if re.match(r'^\d+\.',q)][:12]
    # sections by question heads
    flat=re.sub(r'\s+',' ',main)
    pos=[]
    for h in qheads:
        hh=re.sub(r'\s+',' ',h)
        i=flat.find(hh)
        if i<0:
            i=flat.find(hh[:25])
            if i>=0:
                j=flat.find('?',i); hh=flat[i:j+1] if j>0 and j-i<200 else hh
        if i>=0: pos.append((i,hh))
    pos.sort()
    secs=[]
    if not pos or pos[0][0]>40: secs.append(['',flat[:pos[0][0]] if pos else flat])
    for k,(i,hh) in enumerate(pos):
        e=pos[k+1][0] if k+1<len(pos) else len(flat)
        secs.append([hh,flat[i+len(hh):e]])
    stems=set()
    for k in kws:
        for w in re.findall(r'[А-Яа-яЁё]{5,}',k): stems.add(w.lower()[:6])
    S=[]
    for si,(h,body) in enumerate(secs):
        ss=[s for s in sentences(body) if ok(s)]
        for j,s in enumerate(ss):
            low=s.lower();sc=0
            sc+=2.5*sum(1 for st in stems if st in low)
            if re.search(r' — (это )?[а-яё]',s) or ' это ' in low or 'называ' in low: sc+=2
            if re.search(r'\d',s): sc+=1
            if re.search(r'(главн|важн|крупнейш|основн|больш|причин|поэтому|потому|следовательно|лидер|перв)',low): sc+=1
            if j==0: sc+=1.5
            if len(s)>350: sc-=1
            if len(s)<50: sc-=1
            S.append({'sec':si,'i':j,'t':s,'sc':sc,'len':len(s)})
    total=sum(x['len'] for x in S) or 1
    def pick(frac):
        order=sorted(S,key=lambda x:-x['sc']);keep=set();acc=0
        for x in order:
            if acc>=frac*total: break
            keep.add((x['sec'],x['i']));acc+=x['len']
        return keep
    def render(keep):
        out=[]
        for si,(h,b) in enumerate(secs):
            sents=[x['t'] for x in S if x['sec']==si and (x['sec'],x['i']) in keep]
            if sents: out.append({'h':h,'p':sents})
        return out
    detailed=render(pick(0.88)); medium=render(pick(0.52))
    conc=[s for s in sentences(re.sub(r'\s+',' ',concl)) if len(s)>15]
    # short: key terms with definitions + top facts
    terms=[]
    for k in kws:
        st=[w.lower()[:6] for w in re.findall(r'[А-Яа-яЁё]{4,}',k)]
        best=None
        for x in sorted(S,key=lambda x:(-x['sc'],x['len'])):
            if st and all(z in x['t'].lower() for z in st[:2]) and x['len']<330: best=x['t'];break
        terms.append({'term':k,'def':best})
    used={t['def'] for t in terms}
    facts=[x for x in sorted(S,key=lambda x:-x['sc']) if x['t'] not in used and x['len']<280]
    budget=0.22*total-sum(len(t['def'] or '') for t in terms)-sum(map(len,conc))
    fk=[];acc=0
    for x in facts:
        if acc>max(budget,0.06*total): break
        fk.append(x);acc+=x['len']
    fk.sort(key=lambda x:(x['sec'],x['i']))
    short={'concl':conc,'terms':terms,'facts':[x['t'] for x in fk]}
    res.append({'id':n,'num':'§ %d%s'%(n,'*' if n in STAR else ''),'title':title,'page':pg,'chapter':chap(n),'short':short,'medium':medium,'detailed':detailed,'conclusions':conc,'keywords':kws,'questions':qlist,'stats':{'src':total}})
    print(n,len(secs),len(S),total,len(kws),len(conc),len(qlist),sum(len(' '.join(s['p'])) for s in medium)/total)
json.dump(res,open('geo.json','w'),ensure_ascii=False)
