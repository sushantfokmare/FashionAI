


// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// export default function Dashboard({ user, onLogout }) {
//   return (
//     <div className="p-8 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
//       <h1 className="text-3xl font-bold text-purple-700 mb-4">
//         Welcome back, {user || "Guest"} 👋
//       </h1>
//       <p className="text-gray-600 mb-8">
//         Here's your personal fashion dashboard.
//       </p>

//       {/* Stats cards */}
//       <div className="grid md:grid-cols-3 gap-4 mb-8">
//         <Card className="shadow-md max-w-xs mx-auto rounded-xl hover:shadow-lg transition">
//           <CardContent className="text-center py-4">
//             <p className="text-3xl font-bold text-purple-700">8</p>
//             <p className="text-gray-600 text-sm">Saved Looks</p>
//           </CardContent>
//         </Card>

//         <Card className="shadow-md max-w-xs mx-auto rounded-xl hover:shadow-lg transition">
//           <CardContent className="text-center py-4">
//             <p className="text-3xl font-bold text-pink-600">14</p>
//             <p className="text-gray-600 text-sm">Recent Generations</p>
//           </CardContent>
//         </Card>

//         <Card className="shadow-md max-w-xs mx-auto rounded-xl hover:shadow-lg transition">
//           <CardContent className="text-center py-4">
//             <p className="text-3xl font-bold text-indigo-600">5</p>
//             <p className="text-gray-600 text-sm">Favorites</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="flex justify-center">
//         <Button
//           onClick={onLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow"
//         >
//           Logout
//         </Button>
//       </div>
//     </div>
//   );
// }

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Welcome back, {user?.fullName || "Guest"} 👋
      </h1>
      <p className="text-gray-600 mb-10">
        Here's your personal fashion dashboard.
      </p>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="shadow-md">
          <CardContent className="text-center py-6">
            <p className="text-4xl font-bold text-purple-700">8</p>
            <p className="text-gray-600">Saved Looks</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="text-center py-6">
            <p className="text-4xl font-bold text-pink-600">14</p>
            <p className="text-gray-600">Recent Generations</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="text-center py-6">
            <p className="text-4xl font-bold text-indigo-600">5</p>
            <p className="text-gray-600">Favorites</p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
      >
        Logout
      </Button>
    </div>
  );
}
