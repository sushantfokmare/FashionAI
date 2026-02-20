import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Sparkles, Heart, Eye, TrendingUp } from 'lucide-react';

// Curated design images
const designImages = [
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', title: 'Elegant Summer', likes: 2847, views: 12453 },
  { url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80', title: 'Urban Chic', likes: 3921, views: 15632 },
  { url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80', title: 'Minimal Grace', likes: 1893, views: 9274 },
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', title: 'Vintage Bloom', likes: 4156, views: 18921 },
  { url: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1200&q=80', title: 'Bold Statement', likes: 2634, views: 11087 },
  { url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80', title: 'Classic Fusion', likes: 3487, views: 14209 },
];

export const TrendingItems = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Duplicate the list to create a seamless loop
  const loopImages = useMemo(() => [...designImages, ...designImages], []);

  return (
    <section
      id="categories"
      className="relative py-28 overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800"
    >
      {/* Decorative elements - different from Hero */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-rose-300 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-300 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Distinct style */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 shadow-lg"
          >
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Trending Now</span>
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight"
          >
            AI-Generated
            <br />
            <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Fashion Designs
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium"
          >
            Discover cutting-edge fashion concepts created by artificial intelligence. Each design showcases the perfect blend of creativity and technology.
          </motion.p>
        </motion.div>

        {/* Infinite scroll carousel */}
        <div className="relative">
          <div className="trending-wrapper">
            <div className="trending-track">
              {loopImages.map((design, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 0.5) }}
                  className="group relative w-80 flex-shrink-0"
                >
                  {/* Premium card design */}
                  <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                    {/* Image container */}
                    <div className="relative h-96 overflow-hidden">
                      <img 
                        src={design.url} 
                        alt={design.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                      
                      {/* AI Badge - elegant design */}
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 shadow-lg">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">AI Created</span>
                          </div>
                        </div>
                      </div>

                      {/* Content - always visible but enhanced on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-6 transform transition-all duration-500">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:mb-4">{design.title}</h3>
                        
                        {/* Stats - slide up on hover */}
                        <div className="flex items-center gap-4 text-white mb-4 opacity-80 group-hover:opacity-100">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-semibold">{design.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-semibold">{design.views.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* CTA button - appears on hover */}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full px-5 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0"
                        >
                          Explore Design
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl -z-10 transition-opacity duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Fresh AI designs generated every hour — endless inspiration awaits
            </span>
          </div>
        </motion.div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes scroll-ltr {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }

          .trending-track {
            display: flex;
            gap: 2rem;
            width: max-content;
            animation: scroll-ltr 50s linear infinite;
          }

          .trending-wrapper {
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            padding: 1rem 0;
          }

          .trending-wrapper:hover .trending-track {
            animation-play-state: paused;
          }

          @media (max-width: 768px) {
            .trending-track {
              gap: 1.5rem;
              animation-duration: 35s;
            }
          }
        `}
      </style>
    </section>
  );
};
