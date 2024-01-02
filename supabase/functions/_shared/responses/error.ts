export const errorResponse = (errorMessage?: string, description?: string) => {
  return new Response(
    JSON.stringify({
      code: 500,
      message: "Internal Server Error",
      description: description ?? "An unexpected error occurred",
      error: errorMessage,
    }),
    { headers: { "Content-Type": "application/json" }, status: 500 },
  );
};
