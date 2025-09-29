

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function Login({ setIsAuthenticated }) {
//   const [form, setForm] = useState({ email: "", password: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // 🔑 Demo login
//     if (form.email && form.password) {
//       alert(`Welcome back ${form.email} (Demo Login)`);
//       setIsAuthenticated(true); // update navbar state
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
//       <Card className="w-full max-w-md shadow-lg rounded-2xl border bg-white/90 backdrop-blur">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold text-purple-700">
//             Login to FashionAI
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 className="mt-1"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={handleChange}
//                 className="mt-1"
//                 required
//               />
//             </div>
//             <Button
//               type="submit"
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
//             >
//               Login
//             </Button>
//           </form>
//           <p className="text-center text-sm text-gray-500 mt-4">
//             Don’t have an account?{" "}
//             <a href="/signup" className="text-purple-600 hover:underline">
//               Sign Up
//             </a>
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsAuthenticated, setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setUser(form.email); // 👈 email user म्हणून सेट
    navigate("/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-purple-700">
            Login to FashionAI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
