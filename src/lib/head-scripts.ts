/**
 * Inline scripts for <head>, run before first paint. They live in a plain
 * (non-"use client") module so the server layout gets the actual strings.
 */

/** Theme: saved choice, else the visitor's system setting. */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * The home hero's login sequence plays once per browser session. This runs in
 * <head> before first paint, so it works before React hydrates:
 *  - on a repeat visit it marks <html data-intro="done"> straight away, so the
 *    hero shows its final state with no flash of the animation's first frame;
 *  - otherwise any click or keypress marks it done, skipping to the end.
 * components/hero-intro.tsx sets the session flag and ends it after ~2.4s.
 */
export const INTRO_KEY = "intro-played";

export const introScript = `(function(){var d=document.documentElement;function done(){d.setAttribute("data-intro","done");removeEventListener("pointerdown",done,true);removeEventListener("keydown",done,true)}try{if(sessionStorage.getItem("${INTRO_KEY}"))return done()}catch(e){}addEventListener("pointerdown",done,true);addEventListener("keydown",done,true)})()`;

/** Marks <html data-js> so CSS can tell JavaScript is running (e.g. the phone nav collapses only then). */
export const jsScript = `document.documentElement.setAttribute("data-js","")`;
