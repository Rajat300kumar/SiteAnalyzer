import os, json


class pvp_ops():
    def __init__(self):
        self.cmp_path = '/var/www/html/pvp/'
        self.ref_pdf_link = 'http://localhost/pvp/{0}/{1}/Input/{2}'
        return

    def get_all_comps(self):
        all_comps = os.listdir(self.cmp_path)
        cmp_tkr_ar = []
        for each_cmp in all_comps:
            tickers = os.listdir(os.path.join(self.cmp_path, each_cmp))
            for tkr in tickers:
                cmp_tkr_ar.append((each_cmp, ':'.join(tkr.split('_'))))
        cmp_tkr_ar.sort()
        return json.dumps({"status":"Done", "data":cmp_tkr_ar})

    def save_metadata(self, cmp_name, ticker, doc_name, data_dict):
        meta_file = os.path.join(self.cmp_path, cmp_name, ticker, 'Input', '{0}_metadata.txt'.format(doc_name.replace('.pdf', '')))
        f = open(meta_file, 'w')
        f.write(json.dumps(data_dict))
        return json.dumps({"status":"Done", "data":data_dict})

    def read_metadata(self, cmp_name, ticker, doc_name):
        meta_file = os.path.join(self.cmp_path, cmp_name, ticker, 'Input', '{0}_metadata.txt'.format(doc_name.replace('.pdf', '')))
        if not os.path.exists(meta_file):
           return json.dumps({"status":"No Metadata Added", "data":{}})
        f = open(meta_file, 'r')
        all_line = f.readline()
        data_dict = json.loads((all_line))
        return json.dumps({"status":"Done", "data":data_dict})

    def save_cmp(self, cmp_name, ticker):
        cmp_name = '_'.join(cmp_name.split())
        ticker = ticker.replace(':', '_')
        new_cmp_path = os.path.join(self.cmp_path, cmp_name, ticker, 'Input')
        if os.path.exists(new_cmp_path):
            return json.dumps({"status":"Done", "msg":"This company already exists"})
        os.makedirs(new_cmp_path)
        return json.dumps({"status":"Done", "msg":"new comapny added"})

    def get_all_documents(self, cmp_name, ticker):
        ticker = ticker.replace(':', '_')
        input_path = os.path.join(self.cmp_path, cmp_name, ticker, 'Input')
        all_docs = os.listdir(input_path)
        doc_lst = []
        for each_doc in all_docs:
            try:
                if each_doc.split('.')[1] !='pdf':continue
            except:continue
            doc_dict = {}
            doc_path = self.ref_pdf_link.format(cmp_name, ticker, each_doc)
            doc_dict[each_doc]=doc_path
            doc_lst.append(doc_dict)
        return json.dumps({"status":"Done", "data":doc_lst})

    def save_pages(self, cmp_name, ticker, doc_name, pages):
        ticker = ticker.replace(':', '_')
        meta_file = os.path.join(self.cmp_path, cmp_name, ticker, 'Input', '{0}_selected_pages.txt'.format(doc_name.replace('.pdf', '')))
        f = open(meta_file, 'w')
        f.write(json.dumps(pages))
        return json.dumps({"status":"Done", "data":pages})

    def read_selected_pages(self, cmp_name, ticker, doc_name):
        meta_file = os.path.join(self.cmp_path, cmp_name, ticker, 'Input', '{0}_selected_pages.txt'.format(doc_name.replace('.pdf', '')))
        if not os.path.exists(meta_file):
           return json.dumps({"status":"No Pages are selected", "data":{}})
        f = open(meta_file, 'r')
        all_line = f.readline()
        data_dict = json.loads((all_line))
        return json.dumps({"status":"Done", "data":data_dict})

    def upload_docs(self, cmp_name, ticker):
        upload_path = os.path.join(self.cmp_path, cmp_name, ticker, 'Input/')
        if not os.path.exists(upload_path):
           return json.dumps({"status":"This is not valid company", "data":{}})
        return json.dumps({"status":"Done", "data":upload_path})

    def deltee_docs(self, cmp_name, ticker, doc_name):
        ticker = ticker.replace(':', '_')
        doc_path = os.path.join(self.cmp_path, cmp_name, ticker, 'Input', doc_name)
        print ('DOCPATH', doc_path)
        if not os.path.exists(doc_path):
           return json.dumps({"status":"This document is not available", "data":doc_name})
        print ('DOCPATH', doc_path)
        os.remove(doc_path)
        return json.dumps({"status":"Document Deleted", "data":doc_name})






if __name__ == '__main__':
   pvpObj = pvp_ops()
   #print (pvpObj.get_all_comps())
   print (pvpObj.get_all_documents('Amazon', 'NASDAQ:AMZN' ))
   #print (pvpObj.get_all_documents('Amazon', 'NASDAQ:AMZN', {"key":"val"} ))

