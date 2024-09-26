# ComicDreams

This program uses Generative AI to create an entire comic strip from a short scenario or generate bedtime reading e-books with soothing content.

## How it works

### Comic Creation:

1. A Large Language Model (LLM) (OpenAI API) splits the scenario into 6 panels, each with its description and associated text.
2. For each panel:
   - An image is generated with Stable Diffusion (Stability API).
   - The panel text is added to the image.
3. The 6 generated images with their texts are then merged into a final comic strip.

### Bedtime E-Book Creation:

- The program can also create bedtime reading e-books with images, text, and short videos.
- These books often include calming rhythms, soothing stories, and beautiful illustrations, ideal for winding down before sleep.

## Usage

1. Export `OPENAI_API_KEY` and `STABILITY_KEY`:
   - Use `export OPENAI_API_KEY=xxx` or write them in a `.env` file.
2. Install dependencies:

   - `pip install langchain openai stability-sdk pillow`

   _Note: Pillow must be version 9.50 maximum._

3. Edit the `SCENARIO` variable in [kartoon.py](kartoon.py) to match the scenario you want to generate.  
   You can also edit the `STYLE` variable to change the art style.

4. Run the script:
   - `python kartoon.py`

## Examples

### Comic Creation

#### Style: Belgium Comic

```
Characters: Francis is a medieval knight with a shield. Madeline is a princess with long hair.
Francis hears about a dragon terrorizing the kingdom.
He goes to the castle to kill the dragon in an epic battle.
The princess is angry because the dragon was her friend.
```

#### Style: Manga

```
Characters: Adrien is a guy with blond hair. Vincent is a guy with black hair.
Adrien and Vincent work at the office and want to start a new product.
They create it in one night before presenting it to the board.
```

#### Style: American Comic

```
Characters: Peter is a tall guy with blond hair. Steven is a small guy with black hair.
Peter and Steven walk together in New York when aliens attack the city.
They are afraid and try to run for their lives.
The army arrives and saves them.
```

### Bedtime E-Book Creation

#### Example Scenario

```
Characters: Lily is a little girl with curly brown hair. Her cat, Muffin, has soft white fur.
Lily and Muffin explore a magical garden filled with glowing flowers and gentle animals.
As the sun sets, they find a cozy spot under a tree to watch the stars and drift off to sleep.
```

This scenario can be used to generate a calming, illustrated bedtime e-book, perfect for young children.
