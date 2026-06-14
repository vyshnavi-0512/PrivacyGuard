export async function trackEvent(
    eventType: string,
    page?: string,
    metadata?: Record<string, any>
  ) {
    const sessionId =
      localStorage.getItem("sessionId") ??
      crypto.randomUUID();
  
    localStorage.setItem("sessionId", sessionId);
  
    console.log("Sending analytics:", eventType, page);
  
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "privacyguard_user",
          event: eventType,
          page: page ?? "/",
          metadata: {
            ...metadata,
            sessionId,
          },
        }),
      });
  
      console.log("Analytics status:", response.status);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }