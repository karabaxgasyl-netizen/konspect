import pdfplumber, json, re, sys
P='/files/conversation/alekseev_a__geografia_rossii_9_klass_10.pdf'
pdf=pdfplumber.open(P)
out=[]
A,B=int(sys.argv[1]),int(sys.argv[2])
for i in range(A,B):
    pg=pdf.pages[i]
    W=pg.width
    words=pg.extract_words(extra_attrs=['fontname','size'], keep_blank_chars=False, use_text_flow=True)
    lines=[]
    for w in words:
        f=w['fontname'].split('+')[-1]; s=round(w['size'])
        if lines and abs(lines[-1]['top']-w['top'])<3 and lines[-1]['f0']==f.split('-')[0]:
            lines[-1]['words'].append(w); continue
        lines.append({'top':w['top'],'x0':w['x0'],'f0':f.split('-')[0],'words':[w]})
    for L in lines:
        ws=L['words']
        txt=''
        for w in ws:
            t=w['text']
            if 'Bold' in w['fontname'] and 'SchoolBook' in w['fontname']: t='**'+t+'**'
            txt+=(' ' if txt else '')+t
        txt=txt.replace('** **',' ')
        fn=ws[0]['fontname'].split('+')[-1]; sz=round(ws[0]['size'])
        out.append({'p':i+1,'x':round(L['x0']),'f':fn,'s':sz,'t':txt})
json.dump(out,open('lines_%d.json'%A,'w'),ensure_ascii=False)
