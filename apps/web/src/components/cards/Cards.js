import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Cover({ title, accent }) {
    return (_jsx("div", { className: `aspect-square rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`, children: _jsx("div", { className: "flex h-full items-end", children: _jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-white/80", children: title.slice(0, 2) }) }) }));
}
export function ArtistCard({ name, town }) {
    return (_jsx("div", { className: "group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-16 w-16 rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 p-[1px]", children: _jsx("div", { className: "flex h-full w-full items-center justify-center rounded-full bg-[#141414] text-xl font-semibold text-white", children: name.charAt(0) }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-base font-semibold text-white", children: name }), _jsx("p", { className: "mt-1 text-sm text-zinc-400", children: town }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300/80", children: "Artista verificado" })] })] }) }));
}
export function TrackCard({ title, artist }) {
    return (_jsxs("div", { className: "group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]", children: [_jsx(Cover, { title: title, accent: "from-fuchsia-500/90 via-orange-400/90 to-yellow-300/90" }), _jsx("p", { className: "mt-4 truncate text-base font-semibold text-white", children: title }), _jsx("p", { className: "mt-1 text-sm text-zinc-400", children: artist })] }));
}
export function PlaylistCard({ title, description }) {
    return (_jsxs("div", { className: "group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]", children: [_jsx(Cover, { title: title, accent: "from-indigo-500/90 via-sky-500/80 to-emerald-300/80" }), _jsx("p", { className: "mt-4 truncate text-base font-semibold text-white", children: title }), _jsx("p", { className: "mt-1 text-sm leading-6 text-zinc-400", children: description })] }));
}
export function EventCard({ title, venue }) {
    return (_jsxs("div", { className: "group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]", children: [_jsx("div", { className: "flex aspect-square items-end rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/80 via-orange-500/70 to-rose-500/70 p-4", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.24em] text-black/70", children: "Live" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-black", children: venue })] }) }), _jsx("p", { className: "mt-4 text-base font-semibold text-white", children: title }), _jsx("p", { className: "mt-1 text-sm text-zinc-400", children: venue })] }));
}
export function MerchCard({ title, price }) {
    return (_jsxs("div", { className: "group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]", children: [_jsx("div", { className: "flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black", children: _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white", children: "Merch" }) }), _jsx("p", { className: "mt-4 text-base font-semibold text-white", children: title }), _jsx("p", { className: "mt-1 text-sm text-zinc-400", children: price })] }));
}
