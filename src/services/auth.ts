
// Mock authentication functions
export const mockLogin = (email: string, password: string): Promise<{ user: { id: string; name: string; email: string } }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation - in a real app this would verify against a database
      if (email === "user@gmail.com" && password === "password") {
        resolve({
          user: {
            id: "user-123",
            name: "Demo User",
            email: email,
          },
        });
      } else {
        reject(new Error("Invalid login credentials"));
      }
    }, 800);
  });
};

export const mockSignup = (name: string, email: string, password: string): Promise<{ user: { id: string; name: string; email: string } }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would create a new user in the database
      resolve({
        user: {
          id: "new-user-" + Math.random().toString(36).substring(2, 9),
          name,
          email,
        },
      });
    }, 800);
  });
};
