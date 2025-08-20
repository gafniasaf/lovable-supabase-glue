export const http: any = {
  get: (_: any, __: any) => ({}),
  post: (_: any, __: any) => ({})
};
export const HttpResponse: any = { json: (data: any, init?: any) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...(init||{}) }) };


