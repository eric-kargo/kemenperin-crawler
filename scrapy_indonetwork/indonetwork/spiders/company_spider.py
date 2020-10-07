import scrapy
import requests

class CompanySpider(scrapy.Spider):
    name = 'company'
    start_urls = ['https://www.indonetwork.co.id/bahan-bangunan/perusahaan?page='+str(i) for i in range(1, 300)]

    def parse(self, response):
        for title in response.css('.col-md-6'):
            button_id = title.css('.mask-phone-button').xpath('@id').get('')
            button_data_text = title.css('.mask-phone-button').xpath('@data-text').get('')
            telephone = ''
            company = title.css('.link_product::text').get('').strip()
            if (company == ''):
                company = title.css('.pl-0 h3::text').get('').strip()
            if (company == ''):
                continue
            if (button_id != ''):
                data = {
                    'id':"'"+button_data_text+"'",
                    'text':"'"+button_id+"'",
                    'type':"phone",
                    'private':"false"
                }
                req_res = requests.post('https://www.indonetwork.co.id/leads', data=data).json()
                telephone = req_res['text']
            yield {
                'company': company,
                'address': title.css('.seller-name .d-flex+ div::text').get('').strip(':&nbsp'),
                'city': title.css('#lokasi small::text').get(),
                'telephone': telephone,
                'description': title.css('.desc::text').get('').strip()
            }
