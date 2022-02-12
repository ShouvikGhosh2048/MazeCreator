from django.core.exceptions import ValidationError

VALID_CHARACTERS = ['E','B','P','G','C','T']

def is_grid_valid(grid_data):
    #Checks if the given grid data is valid.
    #Format of a grid:
    #There will be two lines.
    #First line will consists of GRID_HEIGHT followed by a single space followed by GRID_WIDTH.
    #Second line will consist of GRID_HEIGHT * GRID_WIDTH characters drawn from VALID_CHARACTERS.
    #No \n at the end of the second line.
    #GRID_HEIGHT & GRID_WIDTH will be integers between 1 and 100 (ends included).

    lines = grid_data.split('\n')
    if len(lines) != 2:
        return False
    
    dimensions = lines[0].split(' ')
    if len(dimensions) != 2:
        return False

    num_of_squares = 1
    for dimension in dimensions:
        try:
            dimension = int(dimension)
        except ValueError:
            return False
        if dimension <= 0 or dimension > 100:
            return False
        num_of_squares *= dimension

    if len(lines[1]) != num_of_squares:
        return False

    player_count = 0
    goal_count = 0
    for ch in lines[1]:
        if not ch in VALID_CHARACTERS:
            return False
        if ch == 'P':
            player_count += 1
            if player_count > 1:
                return False
        if ch == 'G':
            goal_count += 1
            if goal_count > 1:
                return False

    if player_count != 1 or goal_count != 1:
        return False

    return True

def gridValidator(grid_data):
    if not is_grid_valid(grid_data):
        raise ValidationError("The grid data is not valid.")