import socket
import sys
import cherrypy
import json
#import client_report_checking_services_test as client_report_checking_services
import pyapi


apiObj = pyapi.pvp_ops()

config = {
    'global' : {
        'tools.response_headers.on': True,
        'tools.response_headers.headers': [('Content-Type', '*'), ('Access-Control-Allow-Origin', '*')],
        #'server.ssl_module': 'pyopenssl',
        #'server.ssl_certificate' : '/etc/pki/tls/certs/tas-ssl.crt',
        #'server.ssl_private_key' : '/etc/pki/tls/private/tas-cloud.key',
        'server.socket_host' : 'localhost',
        'server.socket_port' : 9097
    }
}



class SupportUtil(object):
    @cherrypy.expose
    def check_health(self):
        return 'Dont Worry - I am doing fine'

    @cherrypy.expose
    def get_company_detais(self,  **args):
        return apiObj.get_all_comps()


    @cherrypy.expose
    def save_metadata(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        doc_name = args.get('doc_name', '')
        dict_dict = args.get('doc_mar', {})
        ticker = ticker.replace(':', '_')
        return apiObj.save_metadata(cmp_name, ticker, doc_name, dict_dict)

    @cherrypy.expose
    def read_metadata(self,  **args):
        print ('ARGSSSSSSSSSSSSSSSSSSSSSS:', args)
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        doc_name = args.get('doc_name', '')
        ticker = ticker.replace(':', '_')
        return apiObj.read_metadata(cmp_name, ticker, doc_name)

    @cherrypy.expose
    def add_cmp(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        return apiObj.save_cmp(cmp_name, ticker)
    
    @cherrypy.expose
    def get_cmp_docs(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        return apiObj.get_all_documents(cmp_name, ticker)


    @cherrypy.expose
    def save_pages(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        ticker = ticker.replace(':', '_')
        doc_name = args.get('doc_name', '')
        pages = args.get('pages', '')
        return apiObj.save_pages(cmp_name, ticker, doc_name, pages)


    @cherrypy.expose
    def read_selected_pages(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        ticker = ticker.replace(':', '_')
        doc_name = args.get('doc_name', '')
        return apiObj.read_selected_pages(cmp_name, ticker, doc_name)

    @cherrypy.expose
    def upload_path(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        ticker = ticker.replace(':', '_')
        return apiObj.upload_docs(cmp_name, ticker)

    @cherrypy.expose
    def deltee_docs(self,  **args):
        cmp_name = args.get('cmp_name', '')
        ticker  = args.get('tkr', '')
        ticker = ticker.replace(':', '_')
        doc_name = args.get('doc_name', '')
        return apiObj.deltee_docs(cmp_name, ticker, doc_name)



    @cherrypy.expose
    def get_report(self,  **args):
        ip_address = cherrypy.request.headers.get('X-Forwarded-For', cherrypy.request.headers.get('Remote-Addr'))
        host = cherrypy.request.headers.get('Origin')
        user_agent = cherrypy.request.headers.get('User-Agent')
        user_agent = user_agent if user_agent else 'Chrome'
        print (ip_address, host, user_agent, cherrypy.request.headers)
        #?projid=10006&docid=[152096, 152098, 152099, 152100]
        iDOcs = args.get('inp_detail', '')
        iendDate = args.get('iendDate', '')
        json_flg = int(args.get('ijson', 0))
        doc_lst = iDOcs.split()
        obj = client_report_checking_services.TOC_Allocate_Docs()
        data = obj.check_client_requested_docs_TEST(doc_lst)
        col_headers = data[0]
        s = self.GetHTML_str( data[1:], col_headers) 
        return s

if __name__ == '__main__':
   cherrypy.quickstart(SupportUtil(), '/', config)


