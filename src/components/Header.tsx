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
            color: 'white',
            fontSize: '20px',
            outline: 'none',
            border: 'none',
            margin: '0',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd700')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
        >
          Search
        </button>
      </nav>
    </header>
  );
}

export default Header;
