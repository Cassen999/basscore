const Footer = () => {
  return (
    <footer className="footer-container">
      <div className='footer-content'>
        <div className="footer-left">
          <p>© {new Date().getFullYear()} Basscore. All rights reserved.</p>
        </div>

        <div className="footer-center">
          <p>
            Contact:{" "}
            <a href="mailto:cassen.gerber@gmail.com">cassen.gerber@gmail.com</a>
          </p>
        </div>

        <div className="footer-right">
          <small>
            All content, including text, graphics, and branding, is the property
            of Basscore and may not be reproduced, distributed, or used without
            permission.
          </small>
        </div>
      </div>
      <div className="initials">
        <img src="/basscore/images/initials.png" alt="Basscore initials" />
      </div>
    </footer>
  );
};

export default Footer;
