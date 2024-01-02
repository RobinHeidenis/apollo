export const unauthorizedResponse = (message?: string) => {
  return new Response(
    JSON.stringify({
      code: 401,
      message: "Unauthorized",
      description: message ?? "You are not authorized to access this endpoint",
    }),
    { headers: { "Content-Type": "application/json" }, status: 401 },
  );
};
