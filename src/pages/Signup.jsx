// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function Signup({ setIsAuthenticated }) {
//   const [form, setForm] = useState({ name: "", email: "", password: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // 🔑 Demo signup
//     if (form.name && form.email && form.password) {
//       alert(`Account created for ${form.name} (Demo Signup)`);
//       setIsAuthenticated(true); // login status update
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4">
//       <Card className="w-full max-w-md shadow-lg rounded-2xl border bg-white/90 backdrop-blur">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold text-pink-600">
//             Create Your Account
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 name="name"
//                 type="text"
//                 placeholder="Your name"
//                 value={form.name}
//                 onChange={handleChange}
//                 className="mt-1"
//                 required
//               />
//             </div>
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
//               className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg transition"
//             >
//               Sign Up
//             </Button>
//           </form>
//           <p className="text-center text-sm text-gray-500 mt-4">
//             Already have an account?{" "}
//             <a href="/login" className="text-pink-600 hover:underline">
//               Login
//             </a>
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";

export default function Signup({ setIsAuthenticated, setUser }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    // इथे API call करून user save करू शकतोस
    setUser({ fullName, email }); // 👈 fullName state मध्ये ठेवतोय
    setIsAuthenticated(true);
  };

  return (
    <form
      onSubmit={handleSignup}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
}
