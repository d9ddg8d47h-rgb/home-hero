-- Home Hero: add a category to each exercise, and backfill the 28 starter
-- exercises (from seed_exercises.sql) with their categories.

alter table public.exercises add column if not exists category text;
create index if not exists exercises_category_idx on public.exercises(category);

update public.exercises set category = 'Gross Motor' where name in (
  'Bear Crawl', 'Crab Walk', 'Wheelbarrow Walking', 'Obstacle Crawl-Through'
) and category is null;

update public.exercises set category = 'Strength' where name in (
  'Wall Push-Ups', 'Sit-to-Stand', 'Superman / Rocket Pose', 'Bridging'
) and category is null;

update public.exercises set category = 'Balance' where name in (
  'Single-Leg Stand ("Flamingo")', 'Heel-to-Toe Walk', 'Balance Beam / Line Walk', 'Wobble Cushion Standing'
) and category is null;

update public.exercises set category = 'Coordination' where name in (
  'Ball Catch and Throw', 'Cross-Crawl Marching', 'Balloon Tap', 'Simon Says Movements'
) and category is null;

update public.exercises set category = 'Stretching' where name in (
  'Calf Stretch', 'Seated Hamstring Stretch', 'Child''s Pose'
) and category is null;

update public.exercises set category = 'Functional Play' where name in (
  'Stair Climbing Practice', 'Ball Kicking', 'Getting Up From the Floor'
) and category is null;

update public.exercises set category = 'Gait' where name in (
  'Heel Walking', 'Tip-Toe Walking', 'Marching with High Knees'
) and category is null;

update public.exercises set category = 'Core' where name in (
  'Tummy Time / Prone Play', 'Modified Curl-Ups', 'Modified Plank Hold'
) and category is null;

-- Anything else (custom exercises you added yourself) falls back to Uncategorised
-- so the filter/search UI has something sensible to show.
update public.exercises set category = 'Uncategorised' where category is null;
