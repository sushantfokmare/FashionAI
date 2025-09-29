export function createPageUrl(name){
  const map = {
    Home: '/',
    Generator: '/generator',
    About: '/about',
    Contact: '/contact',
    Dashboard: '/dashboard',
  }
  return map[name] || '/'
}
