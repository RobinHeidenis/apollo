export const okResponse = (body: string | object) => {
  return new Response(
    typeof body === "string"
      ? body
      : JSON.stringify({ code: 200, message: "OK", ...body }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
};
