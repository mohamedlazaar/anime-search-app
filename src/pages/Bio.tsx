// import React from 'react';

// const BioLandingPage = () => {
//   return (
//     <div style={{ maxWidth: 400, margin: 'auto', fontFamily: 'Arial, sans-serif', padding: 20, textAlign: 'center' }}>
//       {/* Profile Section */}
//       <img
//         src="https://example.com/profile.jpg"
//         alt="Profile"
//         style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 20 }}
//       />
//       <h1 style={{ marginBottom: 5 }}>Jane Doe</h1>
//       <p style={{ color: '#555', marginBottom: 20 }}>Web Developer & Creator | Sharing tips & projects</p>

//       {/* Links Section */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
//         <a href="https://portfolio.example.com" style={linkStyle}>
//           💻 Portfolio
//         </a>
//         <a href="https://youtube.com/janedoe" style={linkStyle}>
//           ▶️ YouTube Channel
//         </a>
//         <a href="https://blog.example.com" style={linkStyle}>
//           ✍️ Blog
//         </a>
//         <a href="https://twitter.com/janedoe" style={linkStyle}>
//           🐦 Twitter
//         </a>
//         <a href="mailto:jane@example.com" style={linkStyle}>
//           📧 Contact Me
//         </a>
//       </div>
//     </div>
//   );
// };

// const linkStyle = {
//   padding: '10px 0',
//   backgroundColor: '#1DA1F2',
//   color: 'white',
//   textDecoration: 'none',
//   borderRadius: 8,
//   fontWeight: 'bold',
//   fontSize: 16,
// };

// export default BioLandingPage;

import React from 'react';
import { Link, Element, animateScroll as scroll } from 'react-scroll';

const BioLandingPage = () => {
  return (
    <>
      <nav>
        <Link to="section1" smooth={true} duration={500}>Section 1</Link>
        <Link to="section2" smooth={true} duration={500}>Section 2</Link>
        <Link to="section3" smooth={true} duration={500}>Section 3</Link>
      </nav>

      <Element name="section1" style={{ height: '100vh' }}>
        <h2>Section 1</h2>
      </Element>

      <Element name="section2" style={{ height: '100vh' }}>
        <h2>Section 2</h2>
      </Element>

      <Element name="section3" style={{ height: '100vh' }}>
        <h2>Section 3</h2>
      </Element>
    </>
  );
};

export default BioLandingPage;
