export interface PaywallFeature {
  desc: string;
  icon: string;
  title: string;
}

export const PAYWALL_PRO_FEATURES: readonly PaywallFeature[] = [
  {
    icon: '🥗',
    title: 'Análises de IA Ilimitadas',
    desc: 'Fotografa e analisa refeições sem limites diários de tokens.',
  },
  {
    icon: '⏱️',
    title: 'Todos os Protocolos de Jejum',
    desc: 'Acesso a 36h Monge, 48h Reset, OMAD e Jejum Livre prolongado.',
  },
  {
    icon: '🧬',
    title: 'Fases Metabólicas Detalhadas',
    desc: 'Explicações biológicas aprofundadas, cetose e autofagia celular.',
  },
  {
    icon: '📊',
    title: 'Métricas & Tendências Avançadas',
    desc: 'Histórico completo de consistência, peso e estimativas nutricionais.',
  },
  {
    icon: '✨',
    title: 'Temas Exclusivos Sol',
    desc: 'Personaliza a interface com visuais âmbar e acentos solares.',
  },
  {
    icon: '☁️',
    title: 'Sincronização em Nuvem',
    desc: 'Cópia de segurança encriptada e sincronização multi-dispositivo.',
  },
];
