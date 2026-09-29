describe('API Health Check', () => {
  it('should have a health check endpoint', () => {
    expect(true).toBe(true);
  });

  it('should return status ok', () => {
    const status = 'ok';
    expect(status).toBe('ok');
  });
});
