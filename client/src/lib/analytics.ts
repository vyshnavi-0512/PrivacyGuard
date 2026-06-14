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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
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