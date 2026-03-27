import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid #E0DFDB', background: '#F5F5F3' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, color: '#141310' }}>
                Pareto
              </span>
              <span style={{
                background: '#C8F230', color: '#141310',
                fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2
              }}>Builders</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#8A8985', lineHeight: 1.7, maxWidth: 280 }}>
              O marketplace onde empresas encontram os melhores implementadores de IA do Brasil.
            </p>
            <p style={{ fontSize: 10, color: '#C2C1BC', marginTop: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Uma iniciativa Pareto · Parceiro FMA
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#8A8985', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Plataforma
            </p>
            <div className="flex flex-col gap-3">
              {['Explorar Builders', 'Para Empresas', 'Certificação FMA', 'Como funciona'].map(l => (
                <Link key={l} href="#" style={{ fontSize: 13, fontWeight: 300, color: '#4A4946' }}
                  className="hover:text-[#141310] transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#8A8985', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Empresa
            </p>
            <div className="flex flex-col gap-3">
              {['Sobre a Pareto', 'FMA - Faculdade Mar Atlântico', 'Blog', 'Contato'].map(l => (
                <Link key={l} href="#" style={{ fontSize: 13, fontWeight: 300, color: '#4A4946' }}
                  className="hover:text-[#141310] transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '0.5px solid #E0DFDB', paddingTop: 24 }} className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p style={{ fontSize: 11, fontWeight: 300, color: '#C2C1BC' }}>
            © 2025 Pareto Builders. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {['Termos de uso', 'Privacidade'].map(l => (
              <Link key={l} href="#" style={{ fontSize: 11, fontWeight: 300, color: '#8A8985' }}
                className="hover:text-[#141310] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
