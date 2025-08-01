class Base64 {
  static atob(str: string): string {
    try {
      return atob(str);
    } catch (e) {
      console.error('Base64 decode error:', e);
      return '';
    }
  }

  static btoa(str: string): string {
    try {
      return btoa(str);
    } catch (e) {
      console.error('Base64 encode error:', e);
      return '';
    }
  }
}

export default Base64; 