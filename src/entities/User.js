export const User = {
  me(){
    const raw = localStorage.getItem('fashionai_user')
    if(!raw) throw new Error('not logged in')
    return Promise.resolve(JSON.parse(raw))
  },
  login(){
    const demo = { id: 1, email: 'demo@fashion.ai', full_name: 'Demo User' }
    localStorage.setItem('fashionai_user', JSON.stringify(demo))
    window.location.href = '/dashboard'
  },
  logout(){
    localStorage.removeItem('fashionai_user')
    return Promise.resolve()
  }
}
