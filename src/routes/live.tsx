import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { LivePlayer } from "@/components/LivePlayer";
import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Watch Live Football — FUFA TV" },
      { name: "description", content: "Always-on live football. Switch between FUFA Official, UPL, CAF and backup streams in one click." },
      { property: "og:title", content: "Watch Live Football — FUFA TV" },
      { property: "og:description", content: "24/7 live football streaming on FUFA TV." },
    ],
  }),
  component: LivePage,
});

type ChatMsg = { id: string; name: string; text: string; ts: number };

function LivePage() {
  const [chatOpen, setChatOpen] = useState(true);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: "c1", name: "KampalaKid", text: "Vipers all the way! 🔥", ts: Date.now() - 60000 },
    { id: "c2", name: "MbaleFan", text: "Great save by KCCA keeper!", ts: Date.now() - 30000 },
  ]);
  const [name] = useState(() => "Fan" + Math.floor(Math.random() * 9999));
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: Math.random().toString(), name, text: text.slice(0, 200), ts: Date.now() }]);
    setText("");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <h1 className="font-display text-3xl font-extrabold">Live Football Hub</h1>
          <p className="text-sm text-muted-foreground">Always-on streams. If one drops, switch instantly to a backup.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <LivePlayer />
          {chatOpen ? (
            <aside className="flex h-[600px] flex-col rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="flex items-center gap-2 font-display font-bold">
                  <MessageSquare className="h-4 w-4 text-accent" /> Live Chat
                </div>
                <button onClick={() => setChatOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Hide</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 text-sm">
                {msgs.map((m) => (
                  <div key={m.id} className="mb-2">
                    <span className="font-bold text-accent">{m.name}: </span>
                    <span>{m.text}</span>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 border-t border-border p-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Say something..."
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <Button onClick={send} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </aside>
          ) : (
            <Button variant="outline" onClick={() => setChatOpen(true)} className="lg:h-auto">
              <MessageSquare className="mr-2 h-4 w-4" /> Open Chat
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
