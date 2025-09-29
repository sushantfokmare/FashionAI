import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-700 to-pink-600 shadow-md text-white">
      {/* Logo */}
      <h1 className="text-2xl font-extrabold tracking-wide">
        <Link to="/">FashionAI</Link>
      </h1>

      {/* Links */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="hover:text-yellow-300 transition-colors duration-200"
        >
          Home
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/signup">
              <Button
                variant="secondary"
                className="bg-white text-pink-600 hover:bg-pink-100"
              >
                Sign Up
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-purple-100"
              >
                Login
              </Button>
            </Link>
          </>
        ) : (
          <Button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        )}
        <Link to="/generator" className="hover:text-yellow-300">
  Generator
</Link>
<Link to="/dashboard" className="hover:text-yellow-300">
  Dashboard
</Link>

      </div>
    </nav>
  );
}
