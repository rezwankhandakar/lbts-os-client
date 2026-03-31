const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white py-4 px-6 text-center text-xs text-gray-400">
      &copy; {year} LBTS System. All rights reserved.
    </footer>
  );
};

export default Footer;
