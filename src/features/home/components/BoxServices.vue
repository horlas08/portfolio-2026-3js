<script setup lang="ts">
import { computed, ref, watchEffect, onBeforeUnmount } from "vue";
import gsap from "gsap";
import { locale } from "../../../i18n/store";
import AppearingText from "../../../components/AppearingText.vue";
import { BREAKPOINTS } from "../../../utils/sizes";
import { Vector3 } from "three";
import ProjectedElement from "../../../components/ProjectedElement.vue";

const point = new Vector3(0.75, 2.75, 6.75);

const wrapperRef = ref<HTMLDivElement | null>(null);
const timelines = ref<{ timeline: gsap.core.Timeline; delay: number }[]>([]);
const subRefs = ref<HTMLParagraphElement[]>([]);
let matchMedia: gsap.MatchMedia | null = null;

const emit = defineEmits<{
  "timeline:created": [timeline: gsap.core.Timeline];
}>();

watchEffect((onInvalidate) => {
  const wrapperEl = wrapperRef.value;
  if (!wrapperEl) return;

  if (matchMedia) {
    matchMedia.revert();
    matchMedia = null;
  }

  matchMedia = gsap.matchMedia();

  matchMedia.add(
    {
      isMobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
      isDesktop: `(min-width: ${BREAKPOINTS.md}px)`,
    },
    (context) => {
      const { conditions } = context;
      const { isMobile } = conditions as { isMobile: boolean; isDesktop: boolean };

      const tl = gsap.timeline({
        paused: true,
      });

      // Only animate clipPath on desktop
      if (!isMobile) {
        tl.fromTo(
          wrapperEl,
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "none" },
          0,
        );
      } else {
        // On mobile, ensure clipPath is set to visible immediately
        gsap.set(wrapperEl, { clipPath: "inset(0% 0% 0% 0%)" });
      }

      for (let i = 0; i < timelines.value.length; i++) {
        const item = timelines.value[i];
        if (!item) continue;
        tl.add(() => {
          item.timeline.restart(true);
        }, item.delay + 0.25);
      }

      // Only fade in on desktop
      if (!isMobile && subRefs.value.length > 0) {
        const subItems = subRefs.value.filter((ref) => ref !== null && ref !== undefined);
        if (subItems.length > 0) {
          tl.fromTo(subItems, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.1 }, 0.3);
        }
      } else if (isMobile && subRefs.value.length > 0) {
        // On mobile, ensure opacity is 1 immediately
        const subItems = subRefs.value.filter((ref) => ref !== null && ref !== undefined);
        if (subItems.length > 0) {
          gsap.set(subItems, { opacity: 1 });
        }
      }

      emit("timeline:created", tl);

      // Return cleanup function
      return () => {
        tl.kill();
      };
    },
  );

  onInvalidate(() => {
    if (matchMedia) {
      matchMedia.revert();
      matchMedia = null;
    }
  });
});

onBeforeUnmount(() => {
  if (matchMedia) {
    matchMedia.revert();
  }
});

import skillsData from "../../../content/skills.json";

interface SkillItem {
  en?: string;
  de?: string;
  name?: string;
  [key: string]: string | undefined;
}

interface SkillCategory {
  category: string | SkillItem;
  skills: (string | SkillItem)[];
}

interface SkillsJsonObject {
  frontend?: (string | SkillItem)[];
  backend?: (string | SkillItem)[];
  [key: string]: (string | SkillItem)[] | undefined;
}

const activeTab = ref<number | "all">(0);

const handleTimelineCreated = (timeline: gsap.core.Timeline, delay: number) => {
  const updatedTimelines = [...timelines.value, { timeline, delay }];
  timelines.value = updatedTimelines;
};

const skillGroups = computed(() => {
  const currentLang = locale.value as "en" | "de";

  const getItemName = (item: string | SkillItem) => {
    if (typeof item === "string") return item;
    return item[currentLang] || item.en || item.de || item.name || "";
  };

  if (Array.isArray(skillsData)) {
    return (skillsData as unknown as SkillCategory[]).map((cat) => ({
      title: getItemName(cat.category),
      skills: (cat.skills || []).map((s) => ({ name: getItemName(s) })),
    }));
  }

  const objData = skillsData as SkillsJsonObject;
  const groups = [];

  if (objData.frontend && Array.isArray(objData.frontend)) {
    groups.push({
      title: currentLang === "de" ? "Frontend & Mobile Skills" : "Frontend & Mobile Skills",
      skills: objData.frontend.map((s) => ({ name: getItemName(s) })),
    });
  }

  if (objData.backend && Array.isArray(objData.backend)) {
    groups.push({
      title: currentLang === "de" ? "Backend & Cloud Skills" : "Backend & Cloud Skills",
      skills: objData.backend.map((s) => ({ name: getItemName(s) })),
    });
  }

  return groups;
});

const visibleSkillGroups = computed(() => {
  if (activeTab.value === "all") return skillGroups.value;
  const idx = typeof activeTab.value === "number" ? activeTab.value : 0;
  return skillGroups.value[idx] ? [skillGroups.value[idx]] : skillGroups.value;
});
</script>

<template>
  <ProjectedElement :point="point">
    <div ref="wrapperRef" class="box-services" data-lenis-prevent>
      <div class="box-services-tabs">
        <button
          v-for="(group, index) in skillGroups"
          :key="group.title"
          :class="['box-services-tab-btn', { 'is-active': activeTab === index }]"
          @click.stop="activeTab = index"
        >
          {{ group.title.replace('Skills', '').replace('Fähigkeiten', '').trim() }}
        </button>
        <button
          :class="['box-services-tab-btn', { 'is-active': activeTab === 'all' }]"
          @click.stop="activeTab = 'all'"
        >
          All
        </button>
      </div>

      <div class="box-services-container" data-lenis-prevent>
        <div
          class="box-services-card"
          v-for="(group, gIndex) in visibleSkillGroups"
          :key="group.title"
        >
          <div class="box-services-card-title">
            <AppearingText
              :text="group.title"
              :steps="1"
              :duration="0.35"
              @timeline:created="(tl: gsap.core.Timeline) => handleTimelineCreated(tl, gIndex * 0.15)"
            />
          </div>
          <div class="box-services-card-list" data-lenis-prevent>
            <div
              class="box-services-list-item"
              v-for="(service, sIndex) in group.skills"
              :key="service.name"
            >
              <p class="box-services-list-item-name">
                <AppearingText
                  :text="service.name"
                  :steps="1"
                  :duration="0.35"
                  @timeline:created="(tl: gsap.core.Timeline) => handleTimelineCreated(tl, 0.15 + (gIndex * 4 + sIndex) * 0.08)"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ProjectedElement>
</template>

<style scoped lang="scss">
.box-services {
  --line-length: min(48px, calc(var(--svw) * 5));

  position: absolute;
  bottom: var(--count-height);
  width: calc(100% - var(--space-outer) * 2);
  left: var(--space-outer);
  pointer-events: auto;
  touch-action: pan-y;

  @include mixins.landscape {
    width: 480px;
    max-width: calc(var(--svw) * 37);
    padding-left: var(--line-length);
    position: relative;
    left: 0;
    bottom: 0;
    padding-top: 3px;
    transform: translate(0, -50%);
  }

  @include mixins.landscape-large {
    width: 380px;
    max-width: calc(var(--svw) * 36);
  }

  &::after,
  &::before {
    display: none;

    @include mixins.landscape {
      display: block;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 11px;
    height: 11px;
    background-color: var(--color-cyan-400);
    border-radius: 50%;
  }

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    height: 0;
    border-top: var(--stroke-sm) solid var(--color-cyan-400);

    @include mixins.landscape {
      width: var(--line-length);
    }
  }

  &-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: var(--space-xs);
    pointer-events: auto;
    z-index: 10;
  }

  &-tab-btn {
    background: linear-gradient(to bottom, var(--color-hologram-top) 0%, var(--color-hologram-bottom) 100%);
    border: 1px solid var(--color-cyan-400);
    color: var(--color-cyan-400);
    padding: 3px 10px;
    font-size: var(--font-size-xs);
    font-family: "ProFontWindows";
    font-weight: 700;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.75;
    outline: none;

    &:hover {
      opacity: 1;
      background: var(--color-cyan-400);
      color: #050d24;
    }

    &.is-active {
      opacity: 1;
      background: var(--color-cyan-400);
      color: #050d24;
      box-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
    pointer-events: auto;
    touch-action: pan-y;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-cyan-400);
      border-radius: 2px;
    }
  }

  &-card {
    border: var(--stroke-sm) solid var(--color-cyan-400);
    border-radius: var(--radius-md);
    background: linear-gradient(to bottom, var(--color-hologram-top) 0%, var(--color-hologram-bottom) 100%);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);

    @include mixins.landscape {
      padding: var(--space-xs) var(--space-sm);
    }

    @include mixins.mq("md") {
      padding: var(--space-sm) var(--space-md);
    }

    &-title {
      font-size: var(--font-size-title-xxs);
      font-weight: 700;

      @include mixins.landscape {
        font-size: var(--font-size-title-xxs);
      }

      @include mixins.landscape-large {
        font-size: var(--font-size-title-xs);
      }
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      max-height: 150px;
      overflow-y: auto;
      padding-right: 2px;
      pointer-events: auto;
      touch-action: pan-y;

      &::-webkit-scrollbar {
        width: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-cyan-400);
        border-radius: 2px;
      }
    }
  }

  &-list-item {
    display: flex;
    flex-direction: column;
    padding-left: 18px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 2px;
      top: 6px;
      width: 4px;
      height: 4px;
      background-color: var(--color-text-cyan-400);
      border-radius: 50%;
    }

    &-name {
      font-size: var(--font-size-md);

      @include mixins.landscape {
        font-size: var(--font-size-sm);
      }

      @include mixins.landscape-large {
        font-size: var(--font-size-lg);
      }
    }
  }
}
</style>
