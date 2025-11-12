import { useLocation } from "react-router";

interface HeaderProps {
  isSearch: () => void;  
}

function Header({ isSearch }: HeaderProps) {  
  const location = useLocation();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: location.pathname === '/' ? 'fixed' : 'relative', 
        top: 0,
        left: 0,
        zIndex: 9999, 
        width: '100vw',
        right: 0,
        height: '10%',
        padding: '0px 20px',
        backgroundColor: '#000000ff'
      }}
    >
      <h1 style={{ color: 'white', fontSize: '30px' }}>Anime Search App</h1>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '20px' }}>
          Home
        </a>
        
        <button
          onClick={isSearch}  
          style={{
            background: 'none',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            outline: 'none',
            border: 'none',
            margin: '0',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd700')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
              <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
        </button>
      </nav>
    </header>
  );
}

export default Header;
