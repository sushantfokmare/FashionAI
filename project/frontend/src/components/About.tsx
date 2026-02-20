import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  TrendingUp,
  ShoppingBag,
  Clock,
  ShuffleIcon,
  GraduationCap,
  Package,
  Shirt,
  Coffee,
  Briefcase,
  PartyPopper,
  Dumbbell,
  Eye,
  Zap,
  Globe,
  Heart,
  Palette
} from 'lucide-react';

export const About = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const problems = [
    { icon: Clock, text: 'Time-consuming outfit selection' },
    { icon: ShuffleIcon, text: 'Confusing due to too many options' },
    { icon: Package, text: 'Lacking proper style coordination' },
    { icon: GraduationCap, text: 'Difficult without fashion knowledge' }
  ];

  const solutions = [
    { icon: Shirt, text: 'Complete outfits (Top, Bottom, Footwear, Accessories)' },
    { icon: Coffee, text: 'Occasion-based styling (Casual, Party, Formal, Sports)' },
    { icon: Palette, text: 'AI-generated fashion designs' },
    { icon: Eye, text: 'Image-based and text-based discovery' }
  ];

  const occasions = [
    { icon: Coffee, label: 'Casual', color: 'from-blue-500 to-cyan-500' },
    { icon: PartyPopper, label: 'Party', color: 'from-purple-500 to-pink-500' },
    { icon: Briefcase, label: 'Formal', color: 'from-gray-600 to-gray-800' },
    { icon: Dumbbell, label: 'Sports', color: 'from-green-500 to-emerald-500' }
  ];

  const features = [
    'Complete outfit recommendations',
    'Smart, context-aware styling',
    'AI-powered creativity',
    'User-friendly experience'
  ];

  const futureScopes = [
    { icon: ShoppingBag, text: 'Online shopping platforms' },
    { icon: Eye, text: 'Virtual try-on experiences' },
    { icon: TrendingUp, text: 'Fashion trend dashboards' },
    { icon: Sparkles, text: 'Designer assistance tools' }
  ];

  return (
    <section 
      id="about" 
      className="relative min-h-screen py-24 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [45, 0, 45],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full blur-3xl"
        />
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">About FashionAI Studio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
          >
            What is{' '}
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FashionAI Studio?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
          >
            FashionAI Studio is an AI-powered fashion recommendation and design platform that helps users discover complete outfits, match clothing intelligently, and visualize designs using artificial intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="inline-block px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20"
          >
            <p className="text-lg font-bold text-transparent bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text">
              Making fashion simpler, faster, and smarter for everyone.
            </p>
          </motion.div>
        </motion.div>

        {/* Problem Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">What Problem Are We Solving?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              The Fashion Challenge
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Choosing the right outfit is often complicated and time-consuming
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:-translate-y-2"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                <div className="relative space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <problem.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-gray-200 font-medium leading-relaxed">
                    {problem.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-center mt-8"
          >
            <div className="inline-block px-6 py-3 bg-red-900/30 backdrop-blur-md rounded-xl border border-red-500/30">
              <p className="text-red-300 font-semibold">
                Most platforms only show individual products, not complete outfit combinations.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">Our Solution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How We Solve It
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-lg text-gray-200 font-semibold leading-relaxed">
                      {solution.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Occasions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mt-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Occasion-Based Styling
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {occasions.map((occasion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center space-y-3"
                  >
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${occasion.color} flex items-center justify-center shadow-lg`}>
                      <occasion.icon className="w-10 h-10 text-white" />
                    </div>
                    <p className="font-bold text-white">{occasion.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-center mt-8"
          >
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl">
              <p className="text-white text-lg font-bold">
                Users get ready-to-wear outfit suggestions, not just random items.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Globe className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">Vision & Future Scope</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Building the Future of Fashion
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our vision is to build a personal AI fashion assistant that revolutionizes how people interact with fashion
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <ul className="space-y-4">
                {['Adapts to user preferences', 'Integrates with e-commerce platforms', 'Supports real-time fashion trends', 'Provides personalized styling recommendations'].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200 font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Future Scope</h3>
              </div>
              <div className="space-y-4">
                {futureScopes.map((scope, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <scope.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-200 font-semibold">{scope.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Why FashionAI Studio */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why FashionAI Studio?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                <div className="relative space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                  <p className="text-gray-200 font-bold">{feature}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="inline-block mt-8 px-12 py-6 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl"
          >
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              FashionAI Studio brings intelligence into fashion.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
