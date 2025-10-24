"use client";
import "@/app/globals.css";
import React, { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Buttons } from "@/components/(reusable)/buttons";
import { Images } from "@/components/(reusable)/images";
import { Holds } from "../(reusable)/holds";

export function AnimatedHamburgerButton() {
  const [active, setActive] = useState(false);

  return (
    <div className=" flex flex-row-reverse">
      <MotionConfig transition={{ duration: 0.7 }}>
        <motion.button
          animate={active ? "open" : "closed"}
          onClick={() => setActive(!active)}
          className="relative mb-2 mt-1 h-20 w-20  rounded-none transition-colors"
        >
          <Holds>
            <motion.span
              initial={false}
              animate={active ? "open" : "closed"}
              style={{
                left: "50%",
                top: "35%",
                x: "-50%",
                y: "-50%",
              }}
              className="absolute h-1 w-10 rounded-full bg-black"
              variants={{
                open: {
                  rotate: [0, 0, 45],
                  top: ["35%", "50%", "50%"],
                },
                closed: {
                  rotate: [45, 0, 0],
                  top: ["50%", "50%", "35%"],
                },
              }}
            />
            <motion.span
              initial={false}
              animate={active ? "open" : "closed"}
              style={{
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
              }}
              className="absolute h-1 w-10 rounded-full bg-black"
              variants={{
                open: {
                  rotate: [0, 0, -45],
                },
                closed: {
                  rotate: [-45, 0, 0],
                },
              }}
            />
            <motion.span
              initial={false}
              animate={active ? "open" : "closed"}
              style={{
                left: "50%",
                bottom: "35%",
                x: "-50%",
                y: "50%",
              }}
              className="absolute h-1 w-10 rounded-full bg-black"
              variants={{
                open: {
                  rotate: [0, 0, 45],
                  bottom: ["35%", "50%", "50%"],
                },
                closed: {
                  rotate: [45, 0, 0],
                  bottom: ["50%", "50%", "35%"],
                },
              }}
            />
          </Holds>
        </motion.button>
        <motion.div
          initial={false}
          animate={active ? "open" : "closed"}
          className="flex-row none items-center mt-2 z-10 h-20 w-[150%]"
          variants={{
            open: {
              opacity: [0, 0, 0.25, 0.5, 1],
              display: ["none", "flex", "flex", "flex", "flex"],
              width: ["0%", "25%", "50%", "75%", "100%"],
            },
            closed: {
              opacity: [0.5, 0],
              display: ["flex", "flex", "flex", "flex", "none"],
              width: ["100%", "50%", "0%"],
            },
          }}
        >
          <motion.div
            transition={{
              delay: 0.5,
            }}
            initial={false}
            animate={active ? "open" : "closed"}
            variants={{
              open: {
                opacity: [0, 0, 0.25, 0.5, 1],
              },
              closed: {
                opacity: [0.5, 0],
              },
            }}
          >
            <Buttons href="/hamburger/settings" background={"none"}>
              <Holds>
                <Images
                  titleImg={"/settings.svg"}
                  titleImgAlt={"settings"}
                  position={"right"}
                  size={"70"}
                />
              </Holds>
            </Buttons>
          </motion.div>
          <motion.div
            transition={{
              delay: 0.4,
            }}
            initial={false}
            animate={active ? "open" : "closed"}
            variants={{
              open: {
                opacity: [0, 0, 0.25, 0.5, 1],
              },
              closed: {
                opacity: [0.5, 0],
              },
            }}
          >
            <Buttons href="/hamburger/inbox" background={"none"}>
              <Holds>
                <Images
                  titleImg={"/inbox.svg"}
                  titleImgAlt={"inbox"}
                  position={"right"}
                  size={"70"}
                />
              </Holds>
            </Buttons>
          </motion.div>
          <motion.div
            transition={{
              delay: 0.3,
            }}
            initial={false}
            animate={active ? "open" : "closed"}
            variants={{
              open: {
                opacity: [0, 0, 0.25, 0.5, 1],
              },
              closed: {
                opacity: [0.5, 0],
              },
            }}
          >
            <Buttons href="/hamburger/profile" background={"none"}>
              <Holds>
                <Images
                  titleImg={"/profileEmpty.svg"}
                  titleImgAlt={"profile"}
                  position={"right"}
                  size={"70"}
                />
              </Holds>
            </Buttons>
          </motion.div>
          <motion.div
            transition={{
              delay: 0.2,
            }}
            initial={false}
            animate={active ? "open" : "closed"}
            variants={{
              open: {
                opacity: [0, 0, 0.25, 0.5, 1],
              },
              closed: {
                opacity: [0.5, 0],
              },
            }}
          ></motion.div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
