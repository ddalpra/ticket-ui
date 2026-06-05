export const environment = {
  production: true,
  apiUrl: '/api/v1',
  keycloak: {
    // In container il browser raggiunge Keycloak dall'host, non dalla rete interna
    url:      'http://localhost:8080',
    realm:    'ticket',
    clientId: 'ticket-frontend'
  }
};
