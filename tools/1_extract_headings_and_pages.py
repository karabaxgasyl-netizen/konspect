import json, re, subprocess
P='/files/conversation/alekseev_a__geografia_rossii_9_klass_10.pdf'
L=json.load(open('lines.json'))
heads={}
for x in L:
    if x['f'].startswith('FreeSet') and x['s'] in (12,13) and not x['t'].strip().isdigit():
        heads.setdefault(x['p'],[]).append(x['t'].strip())
# TOC
toc=subprocess.run(['pdftotext','-f','5','-l','7','-layout',P,'-'],capture_output=True,text=True).stdout
toc=re.sub(r'\n(?!§|Тема|РАЗДЕЛ|[А-ЯЁ]{4,}|\s*$|Россия|Заключ|Прилож|Введ)',' ',toc)
items=[];theme=None;section=None;region=None
for line in toc.split('\n'):
    s=line.strip()
    if s.startswith('РАЗДЕЛ'): section=s
    elif s.startswith('Тема'): theme=s; region=None
    elif re.match(r'^[А-ЯЁ ]{6,}$',s): region=s.title()
    m=re.match(r'^§\s*(\d+)(\*?)\.\s*(.+?)[\s\.]*\s(\d+)$',s)
    if m:
        t=re.sub(r'(\s*\.\s*){2,}',' ',m.group(3)).strip(' .')
        items.append({'n':int(m.group(1)),'star':bool(m.group(2)),'title':t,'page':int(m.group(4)),'theme':theme,'region':region})
print(len(items))
pages={}
for p in range(8,316):
    pages[p]=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),P,'-'],capture_output=True,text=True).stdout
def norm(s): return re.sub(r'\s+',' ',s).strip()
json.dump({'items':items,'heads':heads},open('meta.json','w'),ensure_ascii=False)
json.dump(pages,open('pages.json','w'),ensure_ascii=False)
for it in items[:60]: print(it['n'],it['star'],it['title'],it['page'],it['theme'],it['region'])
