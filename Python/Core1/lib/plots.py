import matplotlib.pyplot as plt
import sys
if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")

import seaborn as sns
# settings for seaborn plotting style
sns.set(color_codes=True)
# settings for seaborn plot sizes
sns.set(rc={'figure.figsize':(5,5)})

def make_plot(name, data):
   ax = sns.distplot(data,
      kde=True,
      bins=100,
      color='skyblue',
      hist_kws={"linewidth": 15,'alpha':1})
   ax.set(xlabel=name, ylabel='Frequency')
   plt.show()